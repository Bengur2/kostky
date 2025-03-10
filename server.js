const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static(__dirname));

const players = {};

io.on('connection', (socket) => {
    socket.on('join', (name) => {
        players[socket.id] = { name: name, rolls: [] };
        io.emit('updateResults', Object.values(players));
    });

    socket.on('roll', () => {
        if (players[socket.id] && players[socket.id].rolls.length === 0) {
            players[socket.id].rolls = [
                Math.floor(Math.random() * 100) + 1,
                Math.floor(Math.random() * 100) + 1
            ];
            io.emit('updateResults', Object.values(players));
        }
    });

    socket.on('restart', () => {
        Object.keys(players).forEach(id => players[id].rolls = []);
        io.emit('updateResults', Object.values(players));
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
        io.emit('updateResults', Object.values(players));
    });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server běží na portu ${port}`);
});