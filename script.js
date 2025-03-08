const socket = io();
const playerNameInput = document.getElementById('playerName');
const joinButton = document.getElementById('joinButton');
const gameDiv = document.getElementById('game');
const rollButton = document.getElementById('rollButton');
const resetButton = document.createElement('button');
const resultsDiv = document.getElementById('results');
let playerName;

joinButton.addEventListener('click', () => {
    playerName = playerNameInput.value;
    if (playerName) {
        socket.emit('join', playerName);
        document.getElementById('players').style.display = 'none';
        gameDiv.style.display = 'block';

        if (playerName === "Master") {
            resetButton.textContent = 'Resetovat hody';
            resetButton.addEventListener('click', () => {
                socket.emit('reset', playerName);
            });
            gameDiv.appendChild(resetButton);
        }
    }
});

rollButton.addEventListener('click', () => {
    socket.emit('roll');
});

socket.on('updateResults', (results) => {
    resultsDiv.innerHTML = '';
    results.forEach(result => {
        let rollsDisplay = result.rolls.length > 0 ? result.rolls.join(', ') : 'Ještě neházel';
        resultsDiv.innerHTML += `<p>${result.name}: ${rollsDisplay}</p>`;
    });
});