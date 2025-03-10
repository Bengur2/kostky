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

    const totalShares = playerCount + 1; // Hráči + guildovní podíl
    const sharePerPlayer = Math.floor(lootAmount / totalShares);
    const guildShare = lootAmount - (sharePerPlayer * playerCount);

    lootResultsDiv.innerHTML = `
        <p>Podíl na hráče: ${sharePerPlayer} zlata</p>
        <p>Podíl pro guildu: ${guildShare} zlata</p>
    `;
});