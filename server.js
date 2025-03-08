const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static(__dirname));

const players = [];

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        players.push({ id: socket.id, name: name, rolls: [], rollsCount: 0 });
        io.emit('updateResults', sortPlayers(players));
    });

    socket.on('roll', () => {
        const player = players.find(p => p.id === socket.id);
        if (player && player.rollsCount === 0) {
            for (let i = 0; i < 2; i++) {
                player.rolls.push(Math.floor(Math.random() * 100) + 1);
            }
            player.rollsCount = 2;
            io.emit('updateResults', sortPlayers(players));
        }
    });

    socket.on('reset', (name) => {
        if (name === "Master") {
            players.forEach(player => {
                player.rolls = [];
                player.rollsCount = 0;
            });
            io.emit('updateResults', sortPlayers(players));
        }
    });

    socket.on('disconnect', () => {
        const index = players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            players.splice(index, 1);
            io.emit('updateResults', sortPlayers(players));
        }
        if (players.length === 0) {
            players.forEach(player => {
                player.rolls = [];
                player.rollsCount = 0;
            });
            io.emit('updateResults', sortPlayers(players));
        }
    });
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server běží na portu ${port}`);
});

function sortPlayers(players) {
    return players.slice().sort((a, b) => {
        if (b.rolls.length === 0 && a.rolls.length > 0) return 1;
        if (a.rolls.length === 0 && b.rolls.length > 0) return -1;
        if (a.rolls.length === 0 && b.rolls.length === 0) return 0;

        if (b.rolls[0] !== a.rolls[0]) {
            return b.rolls[0] - a.rolls[0]; // Porovnání podle prvního hodu
        } else {
            return b.rolls[1] - a.rolls[1]; // Porovnání podle druhého hodu, pokud jsou první hody stejné
        }
    });
}