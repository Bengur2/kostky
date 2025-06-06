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

    startAuctionButton.disabled = auctionRunning;

    if (auctionRunning) {
        auctionInfoDiv.innerHTML = `<p>NEJVYŠŠÍ PŘÍHOZ: ${formatNumber(highestBid)} ZLATA</p><p>OD: <span style="color: ${data.highestBidderColor}; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${highestBidder}</span></p><p>ZBÝVÁ ${timeLeft} VTEŘIN...</p>`;
        bidButtonsDiv.style.display = biddingEnabled ? 'block' : 'none';
        updateBidButtons(data.lastBidder);
        auctionResultDiv.textContent = '';
    } else {
        bidButtonsDiv.style.display = 'none';
        if (highestBid > 0) {
            auctionResultDiv.innerHTML = `<span style="color: ${data.highestBidderColor}; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">AUKCI VYHRÁL ${highestBidder}</span> S PŘÍHOZEM ${formatNumber(highestBid)} ZLATA.`;
            updateBidButtons(null);
            updateAuctionHistory(data.history);
        } else if (data.timeLeft === 0 && data.item) {
            auctionResultDiv.textContent = 'AUKCE SKONČILA BEZ PŘÍHOZŮ.';
            updateBidButtons(null);
        } else {
            auctionResultDiv.textContent = '';
            updateBidButtons(null);
        }
    }
});

function updateBidButtons(lastBidder) {
    bidButtons.forEach(button => {
        if (lastBidder === playerName) {
            button.disabled = true;
            button.classList.add('disabled');
        } else {
            button.disabled = false;
            button.classList.remove('disabled');
        }
        if (highestBid >= 100000 && (parseInt(button.dataset.amount) === 1000 || parseInt(button.dataset.amount) === 5000)) {
            button.disabled = true;
            button.classList.add('disabled');
        } else if (lastBidder !== playerName){
            button.disabled = false;
            button.classList.remove('disabled');
        }
    });
}

function updateAuctionHistory(history) {
    auctionHistoryDiv.innerHTML = '<h3>HISTORIE AUKCÍ:</h3>';
    history.forEach(item => {
        auctionHistoryDiv.innerHTML += `<p>${item.item}: <span style="color: ${item.winnerColor}; text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;">${item.winner}</span> (${formatNumber(item.bid)} zlata)</p>`;
    });
}

function formatNumber(number) {
    if (number >= 1000) {
        return (number / 1000).toFixed(0) + 'K';
    }
    return number.toString();
}