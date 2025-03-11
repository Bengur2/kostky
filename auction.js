const auctionItemInput = document.getElementById('auctionItem');
const startAuctionButton = document.getElementById('startAuction');
const auctionInfoDiv = document.getElementById('auctionInfo');
const bidButtonsDiv = document.getElementById('bidButtons');
const auctionResultDiv = document.getElementById('auctionResult');
const bidButtons = document.querySelectorAll('.bidButton');
const auctionHistoryDiv = document.getElementById('auctionHistory');

let auctionRunning = false;
let highestBid = 0;
let highestBidder = '';
let auctionTimer;
let timeLeft = 10;
let biddingEnabled = false;

startAuctionButton.addEventListener('click', () => {
    if (auctionRunning) return;
    const item = auctionItemInput.value;
    if (!item) return;

    socket.emit('startAuction', item);
});

bidButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!auctionRunning || !biddingEnabled) return;
        const bidAmount = parseInt(button.dataset.amount);

        socket.emit('bid', bidAmount, playerName);
    });
});

socket.on('auctionUpdate', (data) => {
    auctionRunning = data.running;
    highestBid = data.highestBid;
    highestBidder = data.highestBidder;
    timeLeft = data.timeLeft;
    biddingEnabled = data.biddingEnabled;

    if (auctionRunning) {
        auctionInfoDiv.innerHTML = `<p>NEJVYŠŠÍ PŘÍHOZ: ${highestBid} ZLATA</p><p>OD: ${highestBidder}</p><p>ZBÝVÁ ${timeLeft} VTEŘIN...</p>`;
        bidButtonsDiv.style.display = biddingEnabled ? 'block' : 'none';
        updateBidButtons(data.lastBidder);
        auctionResultDiv.textContent = '';
    } else {
        bidButtonsDiv.style.display = 'none';
        if (highestBid > 0) {
            auctionResultDiv.textContent = `AUKCI VYHRÁL ${highestBidder} S PŘÍHOZEM ${highestBid} ZLATA.`;
            updateAuctionHistory(data.history);
        } else if (data.timeLeft === 0 && data.item) {
            auctionResultDiv.textContent = 'AUKCE SKONČILA BEZ PŘÍHOZŮ.';
        } else {
            auctionResultDiv.textContent = '';
        }
    }
});

function updateBidButtons(lastBidder) {
    bidButtons.forEach(button => {
        const bidAmount = parseInt(button.dataset.amount);
        if (lastBidder === playerName) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            button.disabled = false;
            button.classList.remove('disabled');
        }
        if (highestBid >= 100000 && (bidAmount === 1000 || bidAmount === 5000)) {
            button.disabled = true;
            button.classList.add('disabled');
        }
    });
}

function updateAuctionHistory(history) {
    auctionHistoryDiv.innerHTML = '<h3>HISTORIE AUKCÍ:</h3>';
    history.forEach(item => {
        auctionHistoryDiv.innerHTML += `<p>${item.item}: ${item.winner} (${item.bid} zlata)</p>`;
    });
}