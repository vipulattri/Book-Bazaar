const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { v4: uuidV4 } = require('uuid');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Store active rooms
const rooms = {};

io.on('connection', socket => {
  console.log(`User connected: ${socket.id}`);

  // Handle book matching events
  socket.on('match-book', (book) => {
    socket.broadcast.emit('book-matched', book);
  });

  // Video call functionality
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    });
  });

  // WebRTC signaling
  socket.on('signal', (toId, signal) => {
    io.to(toId).emit('signal', socket.id, signal);
  });

  // Handle book swipes
  socket.on('swipe-book', (bookId, direction) => {
    // In a real app, you'd save this to a database
    console.log(`Book ${bookId} swiped ${direction}`);
    if (direction === 'right') {
      socket.emit('match', bookId);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));