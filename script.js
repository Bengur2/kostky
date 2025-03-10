const socket = io();
const playerNameInput = document.getElementById('playerName');
const playerColorInput = document.getElementById('playerColor');
const joinButton = document.getElementById('joinButton');
const gameDiv = document.getElementById('game');
const rollButton = document.getElementById('rollButton');
const restartButton = document.getElementById('restartRolls');
const resultsDiv = document.getElementById('results');
const dice = document.querySelectorAll('.die');
let playerName;
let playerColor;

joinButton.addEventListener('click', () => {
    playerName = playerNameInput.value;
    playerColor = playerColorInput.value;
    if (playerName) {
        socket.emit('join', playerName, playerColor);
        document.getElementById('players').style.display = 'none';
        gameDiv.style.display = 'block';
    }
});

rollButton.addEventListener('click', () => {
    socket.emit('roll');
    rollButton.disabled = true;
    dice.forEach(die => die.classList.add('rolling'));
    setTimeout(() => {
        dice.forEach(die => die.classList.remove('rolling'));
    }, 1000);
});

restartButton.addEventListener('click', () => {
    if (confirm('Opravdu chcete restartovat hody?')) {
        socket.emit('restart');
    }
});

socket.on('updateResults', (players) => {
    resultsDiv.innerHTML = '';
    players.forEach(player => {
        let rolls = 'Ještě neházel';
        if (player.rolls && player.rolls.length > 0) {
            rolls = player.rolls.join(', ');
        }
        resultsDiv.innerHTML += `<p style="color: ${player.color};">${player.name}: ${rolls}</p>`;
    });

    const currentPlayer = players.find(player => player.name === playerName);
    if (currentPlayer && currentPlayer.rolls && currentPlayer.rolls.length > 0) {
        dice.forEach((die, index) => {
            die.textContent = currentPlayer.rolls[index];
        });
        rollButton.disabled = true;
    } else {
        dice.forEach(die => die.textContent = '');
        rollButton.disabled = false;
    }
});