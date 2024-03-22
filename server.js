const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

app.use(express.static('public')); // Serve static files from 'public' folder

io.on('connection', (socket) => {
    
    console.log('A user connected');

    // Handle game state changes and broadcast to other clients
    socket.on('gameStateChange', (gameState) => {
        socket.broadcast.emit('gameStateUpdate', gameState);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
