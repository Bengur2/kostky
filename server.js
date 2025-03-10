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
    timeLeft: 0,
    biddingEnabled: false,
    timer: null
};

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        players[socket.id] = { name: name, rolls: [] };
        sendSortedResults();
        sendAuctionState();
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
            auction.timeLeft = 5;
            sendAuctionState();
            startAuctionStartCountdown(); // Změna: voláme funkci pro odpočet začátku aukce
        }
    });

    socket.on('bid', (amount, playerName) => {
        if (auction.running && auction.biddingEnabled) {
            auction.highestBid += amount;
            auction.highestBidder = playerName;
            auction.timeLeft = 10;
            sendAuctionState();
            startAuctionCountdown();
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        sendSortedResults();
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

function startAuctionStartCountdown() { // Nová funkce pro odpočet začátku aukce
    if (auction.timer) {
        clearInterval(auction.timer);
    }
    auction.timer = setInterval(() => {
        auction.timeLeft--;
        sendAuctionState();
        if (auction.timeLeft <= 0) {
            startAuctionCountdown(); // Voláme funkci pro odpočet samotné aukce
        }
    }, 1000);
}

function startAuctionCountdown() {
    if (auction.timer) {
        clearInterval(auction.timer);
    }
    auction.timeLeft = 10;
    auction.biddingEnabled = true; // Povolíme příhozy
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
    sendAuctionState();
}

function sendAuctionState() {
    io.emit('auctionUpdate', auction);
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server běží na portu ${port}`);
});