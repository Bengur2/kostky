const lootAmountInput = document.getElementById('lootAmount');
const playerCountInput = document.getElementById('playerCount');
const divideLootButton = document.getElementById('divideLoot');
const lootResultsDiv = document.getElementById('lootResults');

divideLootButton.addEventListener('click', () => {
    const lootAmount = parseInt(lootAmountInput.value);
    const playerCount = parseInt(playerCountInput.value);

    if (isNaN(lootAmount) || isNaN(playerCount) || playerCount <= 0) {
        lootResultsDiv.textContent = 'Zadejte platná čísla.';
        return;
    }

    socket.emit('divideLoot', lootAmount, playerCount);
});

socket.on('lootUpdate', (data) => {
    const lootAmount = data.lootAmount;
    const playerCount = data.playerCount;
    const share = data.share;

    lootResultsDiv.innerHTML = `
        <p>CELKOVÉ MNOŽSTVÍ: ${lootAmount} ZLATA</p>
        <p>POČET HRÁČŮ: ${playerCount}</p>
        <p>PODÍL NA HRÁČE: ${share} ZLATA</p>
    `;
});