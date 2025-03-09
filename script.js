const socket = io();
const playerNameInput = document.getElementById('playerName');
const joinButton = document.getElementById('joinButton');
const gameDiv = document.getElementById('game');
const rollButton = document.getElementById('rollButton');
const resetButton = document.createElement('button');
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

        if (playerName === "Master") {
            resetButton.textContent = 'Resetovat hody';
            resetButton.addEventListener('click', () => {
                socket.emit('reset', playerName);
            });
            gameDiv.appendChild(resetButton);

            restartButton.textContent = 'Restartovat hru';
            restartButton.addEventListener('click', () => {
                socket.emit('restart');
            });
            gameDiv.appendChild(restartButton);
        }
    }
});

rollButton.addEventListener('click', () => {
    socket.emit('roll');
    rollButton.disabled = true;
    dice.forEach(die => die.classList.add('rolling'));
});

socket.on('updateResults', (players) => {
    resultsDiv.innerHTML = '';
    players.forEach(player => {
        const rolls = player.rolls.length > 0 ? player.rolls.join(', ') : 'Ještě neházel';
        resultsDiv.innerHTML += `<p>${player.name}: ${rolls}</p>`;
    });

    const currentPlayer = players.find(player => player.name === playerName);
    if (currentPlayer && currentPlayer.rolls.length > 0) {
        dice.forEach((die, index) => {
            die.textContent = currentPlayer.rolls[index];
            die.classList.remove('rolling');
        });
        rollButton.disabled = true;
    } else {
        dice.forEach(die => die.textContent = '');
        rollButton.disabled = false;
    }
});