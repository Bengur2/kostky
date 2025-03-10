const socket = io();
const playerNameInput = document.getElementById('playerName');
const joinButton = document.getElementById('joinButton');
const gameDiv = document.getElementById('game');
const rollButton = document.getElementById('rollButton');
const restartButton = document.createElement('button');
const resultsDiv = document.getElementById('results');
const dice = document.querySelectorAll('.die');
let playerName;

joinButton.addEventListener('click', () => {
    playerName = playerNameInput.value;
    if (playerName) {
        socket.emit('join', playerName);
        document.getElementById('players').style.display = 'none';
        gameDiv.style.display = 'block';

        restartButton.textContent = 'Restartovat hru';
        restartButton.addEventListener('click', () => {
            if (confirm('Opravdu chcete restartovat hru?')) {
                socket.emit('restart');
            }
        });
        gameDiv.appendChild(restartButton);
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

socket.on('updateResults', (players) => {
    resultsDiv.innerHTML = '';
    players.forEach(player => {
        let rolls = 'Ještě neházel';
        if (player.rolls && player.rolls.length > 0) {
            rolls = player.rolls.join(', ');
        }
        resultsDiv.innerHTML += `<p>${player.name}: ${rolls}</p>`;
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