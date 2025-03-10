const lootAmountInput = document.getElementById('lootAmount');
const playerCountInput = document.getElementById('playerCount');
const divideLootButton = document.getElementById('divideLoot');
const lootResultsDiv = document.getElementById('lootResults');

divideLootButton.addEventListener('click', () => {
    const lootAmount = parseInt(lootAmountInput.value);
    const playerCount = parseInt(playerCountInput.value);

    if (isNaN(lootAmount) || isNaN(playerCount) || playerCount <= 0) {
        lootResultsDiv.textContent = 'Zadejte platné hodnoty.';
        return;
    }

    socket.emit('divideLoot', lootAmount, playerCount);
});

socket.on('lootUpdate', (data) => {
    if (data.share > 0) {
        lootResultsDiv.innerHTML = `<p>Podíl na hráče a guildu: ${data.share} zlata</p>`;
    } else {
        lootResultsDiv.innerHTML = '';
    }
});