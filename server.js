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
        if (player && player.rollsCount < 2) {
            player.rolls.push(Math.floor(Math.random() * 100) + 1); // Generování čísla od 1 do 100
            player.rollsCount++;
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
        const sumA = a.rolls.reduce((acc, val) => acc + val, 0);
        const sumB = b.rolls.reduce((acc, val) => acc + val, 0);
        return sumB - sumA;