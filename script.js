const socket = io();
const playerNameInput = document.getElementById('playerName');
const joinButton = document.getElementById('joinButton');
const gameDiv = document.getElementById('game');
const rollButton = document.getElementById('rollButton');
const resetButton = document.createElement('button'); // Tlačítko pro resetování
const resultsDiv = document.getElementById('results');
let playerName;

joinButton.addEventListener('click', () => {
    playerName = playerNameInput.value;
    if (playerName) {
        socket.emit('join', playerName);
        document.getElementById('players').style.display = 'none';
        gameDiv.style.display = 'block';

        // Přidání tlačítka pro resetování, pokud je hráč "Master"
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
        resultsDiv.innerHTML += `<p>${result.name}: ${result.roll}</p>`;
    });
});