const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static(__dirname));

const players = {};
let auction = {
    running: false,
    item: '',
    highestBid: 0,
    highestBidder: '',
    highestBidderColor: '#000000',
    timeLeft: 0,
    biddingEnabled: false,
    timer: null,
    history: [],
    lastBidder: null
};

io.on('connection', (socket) => {
    socket.on('join', (name, color) => {
        players[socket.id] = { name: name, color: color, rolls: [] };
        sendSortedResults();
        sendAuctionState();
        sendLootState();
    });

    socket.on('roll', () => {
        if (players[socket.id] && players[socket.id].rolls.length === 0) {
            players[socket.id].rolls = [
                Math.floor(Math.random() * 100) + 1,
                Math.floor(Math.random() * 100) + 1
            ];
            sendSortedResults();
        }
    });

    socket.on('restart', () => {
        Object.keys(players).forEach(id => {
            players[id].rolls = [];
        });
        sendSortedResults();
    });

    socket.on('startAuction', (item) => {
        if (!auction.running) {
            auction.running = true;
            auction.item = item;
            auction.highestBid = 0;
            auction.highestBidder = '';
            auction.highestBidderColor = '#000000';
            auction.timeLeft = 5;
            auction.lastBidder = null;
            auction.biddingEnabled = false;
            sendAuctionState();
            startAuctionStartCountdown();
        }
    });

    socket.on('bid', (amount, playerName) => {
        console.log(`Příhoz ${amount} od ${playerName}`);
        if (auction.running && auction.biddingEnabled) {
            if (auction.lastBidder !== playerName) {
                auction.highestBid += amount;
                auction.highestBidder = playerName;
                auction.highestBidderColor = players[socket.id].color;
                auction.timeLeft = 10;
                auction.lastBidder = playerName;
                sendAuctionState();
                startAuctionCountdown();
            }
        }
    });

    socket.on('divideLoot', (lootAmount, playerCount) => {
        const totalShares = playerCount;
        const sharePerPlayer = Math.floor(lootAmount / totalShares);
        io.emit('lootUpdate', { lootAmount: lootAmount, playerCount: playerCount, share: sharePerPlayer });
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        sendSortedResults();
        if (Object.keys(players).length === 0) {
            resetAuction();
        }
    });
});

function sendSortedResults() {
    const sortedPlayers = Object.values(players).sort((a, b) => {
        if (b.rolls.length === 0 && a.rolls.length === 0) return 0;
        if (b.rolls.length === 0) return -1;
        if (a.rolls.length === 0) return 1;
        if (b.rolls[0] !== a.rolls[0]) {
            return b.rolls[0] - a.rolls[0];
        } else {
            return b.rolls[1] - a.rolls[1];
        }
    });
    io.emit('updateResults', sortedPlayers);
}

function startAuctionStartCountdown() {
    if (auction.timer) {
        clearInterval(auction.timer);
    }
    auction.timer = setInterval(() => {
        auction.timeLeft--;
        sendAuctionState();
        if (auction.timeLeft <= 0) {
            startAuctionCountdown();
        }
    }, 1000);
}

function startAuctionCountdown() {
    if (auction.timer) {
        clearInterval(auction.timer);
    }
    auction.timeLeft = 10;
    auction.biddingEnabled = true;
    sendAuctionState();

    auction.timer = setInterval(() => {
        auction.timeLeft--;
        sendAuctionState();
        if (auction.timeLeft <= 0) {
            endAuction();
        }
    }, 1000);
}

function endAuction() {
    clearInterval(auction.timer);
    auction.running = false;
    auction.biddingEnabled = false;
    if (auction.highestBid > 0) {
        auction.history.push({ item: auction.item, winner: auction.highestBidder, winnerColor: auction.highestBidderColor, bid: auction.highestBid });
    }
    sendAuctionState();
}

function sendAuctionState() {
    io.emit('auctionUpdate', {
        running: auction.running,
        item: auction.item,
        highestBid: auction.highestBid,
        highestBidder: auction.highestBidder,
        highestBidderColor: auction.highestBidderColor,
        timeLeft: auction.timeLeft,
        biddingEnabled: auction.biddingEnabled,
        history: auction.history,
        lastBidder: auction.lastBidder
    });
}

function sendLootState() {
    io.emit('lootUpdate', { lootAmount: 0, playerCount: 0, share: 0 });
}

function resetAuction() {
    auction = {
        running: false,
        item: '',
        highestBid: 0,
        highestBidder: '',
        highestBidderColor: '#000000',
        timeLeft: 0,
        biddingEnabled: false,
        timer: null,
        history: [],
        lastBidder: null
    };
    sendAuctionState();
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server běží na portu ${port}`);
});