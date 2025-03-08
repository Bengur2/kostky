const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const players = [];

app.post('/roll', (req, res) => {
    const { playerName } = req.body;
    let player = players.find(p => p.name === playerName);
    if (!player) {
        player = { name: playerName, rolls: [], rollsCount: 0 };
        players.push(player);
    }
    if (player.rollsCount === 0) {
        for (let i = 0; i < 2; i++) {
            player.rolls.push(Math.floor(Math.random() * 100) + 1);
        }
        player.rollsCount = 2;
        res.json({ message: `${playerName} hodil kostkou: ${player.rolls.join(', ')}` });
    } else {
        res.json({ message: `${playerName} už hodil.` });
    }
});

app.post('/reset', (req, res) => {
    const { playerName } = req.body;
    if (playerName === 'Master') {
        players.forEach(player => {
            player.rolls = [];
            player.rollsCount = 0;
        });
        res.json({ message: 'Hody byly resetovány.' });
    } else {
        res.status(403).json({ message: 'Nemáš oprávnění resetovat hody.' });
    }
});

app.get('/results', (req, res) => {
    res.json({ results: sortPlayers(players) });
});

function sortPlayers(players) {
    return players.slice().sort((a, b) => {
        if (b.rolls.length === 0 && a.rolls.length > 0) return 1;
        if (a.rolls.length === 0 && b.rolls.length > 0) return -1;
        if (a.rolls.length === 0 && b.rolls.length === 0) return 0;

        if (b.rolls[0] !== a.rolls[0]) {
            return b.rolls[0] - a.rolls[0];
        } else {
            return b.rolls[1] - a.rolls[1];
        }
    });
}

app.listen(port, () => {
    console.log(`Backend běží na portu ${port}`);
});