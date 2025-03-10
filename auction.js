const auctionItemInput = document.getElementById('auctionItem');
const startAuctionButton = document.getElementById('startAuction');
const auctionInfoDiv = document.getElementById('auctionInfo');
const bidButtonsDiv = document.getElementById('bidButtons');
const auctionResultDiv = document.getElementById('auctionResult');
const bidButtons = document.querySelectorAll('.bidButton');

let auctionRunning = false;
let highestBid = 0;
let highestBidder = '';
let auctionTimer;

startAuctionButton.addEventListener('click', () => {
    if (auctionRunning) return;
    const item = auctionItemInput.value;
    if (!item) return;

    auctionRunning = true;
    highestBid = 0;
    highestBidder = '';
    auctionInfoDiv.textContent = `Aukce na ${item} začíná za 5 vteřin...`;
    bidButtonsDiv.style.display = 'block';

    setTimeout(() => {
        startCountdown();
    }, 5000);
});

function startCountdown() {
    let timeLeft = 10;
    auctionInfoDiv.textContent = `Aukce probíhá, zbývá ${timeLeft} vteřin...`;

    auctionTimer = setInterval(() => {
        timeLeft--;
        auctionInfoDiv.textContent = `Aukce probíhá, zbývá ${timeLeft} vteřin...`;

        if (timeLeft <= 0) {
            endAuction();
        }
    }, 1000);
}

function endAuction() {
    clearInterval(auctionTimer);
    auctionRunning = false;
    bidButtonsDiv.style.display = 'none';

    if (highestBid > 0) {
        auctionResultDiv.textContent = `Aukci vyhrál ${highestBidder} s příhozem ${highestBid} zlata.`;
    } else {
        auctionResultDiv.textContent = 'Aukce skončila bez příhozů.';
    }
}

bidButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!auctionRunning) return;
        const bidAmount = parseInt(button.dataset.amount);

        if (highestBid >= 100000 && (bidAmount === 1000 || bidAmount === 5000)) {
            return;
        }

        if (bidAmount > highestBid) {
            highestBid = bidAmount;
            highestBidder = playerName; // Předpokládá se, že playerName je definováno v script.js
            auctionInfoDiv.textContent = `Nejvyšší příhoz: ${highestBid} zlata od ${highestBidder}`;
        }
    });
});