const express = require('express');
const router = express.Router();
// In-memory storage for rooms (you can replace this with a database)
const rooms = {};

router.post('/', (req, res) => {
  const roomId = 'your-room-id-generation-logic';
  rooms[roomId] = {
    participants: [],
  };
  res.status(201).json({ roomId });
});

router.post('/:roomId/join', (req, res) => {
  const { roomId } = req.params;
  const { username } = req.body;

  if (rooms[roomId]) {
    rooms[roomId].participants.push(username);
    console.log(`User ${username} has joined room ${roomId}`);
    res.status(200).json({ message: 'Joined room successfully' });
  } else {
    res.status(404).json({ message: 'Room not found' });
  }
});

module.exports = router;