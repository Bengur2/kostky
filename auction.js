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
let timeLeft = 10;
let biddingEnabled = false;

startAuctionButton.addEventListener('click', () => {
    if (auctionRunning) return;
    const item = auctionItemInput.value;
    if (!item) return;

    auctionRunning = true;
    highestBid = 0;
    highestBidder = '';
    auctionInfoDiv.textContent = `Aukce na ${item} začíná za 5 vteřin...`;
    bidButtonsDiv.style.display = 'none';
    biddingEnabled = false;

    setTimeout(() => {
        startCountdown();
    }, 5000);
});

function startCountdown() {
    timeLeft = 10;
    biddingEnabled = true;
    bidButtonsDiv.style.display = 'block';
    updateCountdown();

    if (auctionTimer) {
        clearInterval(auctionTimer); // Zastavení stávajícího timeru
    }

    auctionTimer = setInterval(() => {
        timeLeft--;
        updateCountdown();

        if (timeLeft <= 0) {
            endAuction();
        }
    }, 1000);
}

function updateCountdown() {
    auctionInfoDiv.textContent = `Nejvyšší příhoz: ${highestBid} zlata od ${highestBidder}. Zbývá ${timeLeft} vteřin...`;
}

function endAuction() {
    clearInterval(auctionTimer);
    auctionRunning = false;
    biddingEnabled = false;
    bidButtonsDiv.style.display = 'none';

    if (highestBid > 0) {
        auctionResultDiv.textContent = `Aukci vyhrál ${highestBidder} s příhozem ${highestBid} zlata.`;
    } else {
        auctionResultDiv.textContent = 'Aukce skončila bez příhozů.';
    }
}

bidButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (!auctionRunning || !biddingEnabled) return;
        const bidAmount = parseInt(button.dataset.amount);

        if (highestBid >= 100000 && (bidAmount === 1000 || bidAmount === 5000)) {
            return;
        }

        highestBid += bidAmount; // Přičtení příhozu k aktuálnímu nejvyššímu příhozu
        highestBidder = playerName; // Předpokládá se, že playerName je definováno v script.js
        startCountdown(); // Reset timeru
    });
});