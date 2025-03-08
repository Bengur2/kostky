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
        players.push({ id: socket.id, name: name, roll: 0 });
        io.emit('updateResults', players);
    });
    socket.on('roll', () => {
        const player = players.find(p => p.id === socket.id);
        if (player) {
            player.roll = Math.floor(Math.random() * 6) + 1;
            io.emit('updateResults', players);
        }
    });
    socket.on('disconnect', () => {
        const index = players.findIndex(p => p.id === socket.id);
        if (index !== -1) {
            players.splice(index, 1);
            io.emit('updateResults', players);
        }
    });
});
const port = 3000;
server.listen(port, () => {
    console.log(`Server běží na portu ${port}`);
});