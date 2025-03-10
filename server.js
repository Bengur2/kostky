const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static(__dirname));

const players = {};
const bots = [
    { name: 'Bot 1', rolls: [50, 20] },
    { name: 'Bot 2', rolls: [50, 80] },
    { name: 'Bot 3', rolls: [75, 30] },
    { name: 'Bot 4', rolls: [75, 60] }
];

bots.forEach(bot => players[bot.name] = bot);

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        players[socket.id] = { name: name, rolls: [] };
        sendSortedResults();
    });

    socket.on('roll', () => {
        if (players[socket.id] && players[socket.id].rolls.length === 0) {
            players[socket.id].rolls = [
                Math.floor(Math.random() * 100) + 1,
                Math.floor(Math.random() * 100) + 1
            ];
            sendSortedResults();
        }
    });

    socket.on('restart', () => {
        Object.keys(players).forEach(id => {
            if (!bots.find(bot => bot.name === players[id].name)) {
                players[id].rolls = [];
            }
        });
        sendSortedResults();
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        sendSortedResults();
    });
});

function sendSortedResults() {
    const sortedPlayers = Object.values(players).sort((a, b) => {
        if (b.rolls.length === 0 && a.rolls.length === 0) return 0;
        if (b.rolls.length === 0) return -1;
        if (a.rolls.length === 0) return 1;
        if (b.rolls[0] !== a.rolls[0]) {
            return b.rolls[0] - a.rolls[0];
        } else {
            return b.rolls[1] - a.rolls[1];
        }
    });
    io.emit('updateResults', sortedPlayers);
}

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server běží na portu ${port}`);