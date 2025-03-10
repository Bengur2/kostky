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
//let auctionHistory = []; // Odebráno
//let lastAuctionHistory = JSON.stringify(auctionHistory); // Odebráno

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
        auctionInfoDiv.innerHTML = `<p>Nejvyšší příhoz: ${highestBid} zlata</p><p>Od: ${highestBidder}</p><p>Zbývá ${timeLeft} vteřin...</p>`;
        bidButtonsDiv.style.display = biddingEnabled ? 'block' : 'none';
        updateBidButtons();
        auctionResultDiv.textContent = '';
    } else {
        bidButtonsDiv.style.display = 'none';
        if (highestBid > 0) {
            auctionResultDiv.textContent = `Aukci vyhrál ${highestBidder} s příhozem ${highestBid} zlata.`;
            updateAuctionHistory(data.history); // Upraveno
        } else if (data.timeLeft === 0 && data.item) {
            auctionResultDiv.textContent = 'Aukce skončila bez příhozů.';
        } else {
            auctionResultDiv.textContent = '';
        }
    }
});

function updateBidButtons() {
    bidButtons.forEach(button => {
        const bidAmount = parseInt(button.dataset.amount);
        if (highestBid >= 100000 && (bidAmount === 1000 || bidAmount === 5000)) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            button.disabled = false;
            button.classList.remove('disabled');
        }
    });
}

function updateAuctionHistory(history) {
    auctionHistoryDiv.innerHTML = '<h3>Historie aukcí:</h3>';
    history.forEach(item => {
        auctionHistoryDiv.innerHTML += `<p>${item.item}: ${item.winner} (${item.bid} zlata)</p>`;
    });
}