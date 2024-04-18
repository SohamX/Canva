const express = require('express');
const app = express();
const cors = require('cors');
const http = require('http');
const server = http.createServer(app);
const io = require("socket.io")(server, {
	cors: {
	  origin: "http://localhost:3001"
	}
  });
const roomsRouter = require('./routes/rooms.js');

app.use(cors());
app.use(express.json());

app.use('/rooms', roomsRouter);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  //io.listen(http);
});

const rooms = new Map();

// io.on('connection', (socket) => {
//   const getRoomId = () => {
//     const joinedRoom = [...socket.rooms].find((room) => room !== socket.id);

//     if (!joinedRoom) return socket.id;

//     return joinedRoom;
//   };

//   const leaveRoom = (roomId, socketId) => {
//     const room = rooms.get(roomId);
//     if (!room) return;

//     // const userMoves = room.usersMoves.get(socketId);

//     // if (userMoves) room.drawed.push(...userMoves);
//     room.users.delete(socketId);

//     socket.leave(roomId);
//   };

//   socket.on('create_room', (username) => {
//     let roomId= '';
//     do {
//       roomId = Math.random().toString(36).substring(2, 6);
//     } while (rooms.has(roomId));

//     socket.join(roomId);

//     rooms.set(roomId, {
// //      usersMoves: new Map([[socket.id, []]]),
// //      drawed: [],
//       users: new Map([[socket.id, username]]),
//     });

//     io.to(socket.id).emit('created', roomId);
//   });

//   socket.on('check_room', (roomId) => {
//     if (rooms.has(roomId)) socket.emit('room_exists', true);
//     else socket.emit('room_exists', false);
//   });

//   socket.on('join_room', (roomId, username) => {
//     const room = rooms.get(roomId);

//     if (room && room.users.size < 12) {
//       socket.join(roomId);

//       room.users.set(socket.id, username);
// //      room.usersMoves.set(socket.id, []);

//       io.to(socket.id).emit('joined', roomId);
//     } else io.to(socket.id).emit('joined', '', true);
//   });

//   socket.on('joined_room', () => {
//     const roomId = getRoomId();

//     const room = rooms.get(roomId);
//     if (!room) return;

//     io.to(socket.id).emit(
//       'room',
//       room,
// //      JSON.stringify([...room.usersMoves]),
//       JSON.stringify([...room.users])
//     );

//     socket.broadcast
//       .to(roomId)
//       .emit('new_user', socket.id, room.users.get(socket.id) || 'Anonymous');
//   });

//   socket.on('leave_room', () => {
//     const roomId = getRoomId();
//     leaveRoom(roomId, socket.id);

//     io.to(roomId).emit('user_disconnected', socket.id);
//   });

  // socket.on('draw', (move) => {
  //   const roomId = getRoomId();

  //   const timestamp = Date.now();

  //   // eslint-disable-next-line no-param-reassign
  //   move.id = v4();

  //   addMove(roomId, socket.id, { ...move, timestamp });

  //   io.to(socket.id).emit('your_move', { ...move, timestamp });

  //   socket.broadcast
  //     .to(roomId)
  //     .emit('user_draw', { ...move, timestamp }, socket.id);
  // });

  // socket.on('undo', () => {
  //   const roomId = getRoomId();

  //   undoMove(roomId, socket.id);

  //   socket.broadcast.to(roomId).emit('user_undo', socket.id);
  // });

  // socket.on('mouse_move', (x, y) => {
  //   socket.broadcast.to(getRoomId()).emit('mouse_moved', x, y, socket.id);
  // });

//   socket.on('send_msg', (msg) => {
//     io.to(getRoomId()).emit('new_msg', socket.id, msg);
//   });

//   socket.on('disconnecting', () => {
//     const roomId = getRoomId();
//     leaveRoom(roomId, socket.id);

//     io.to(roomId).emit('user_disconnected', socket.id);
//   });
// });

// Socket.io connection

const connectedUsers = new Map(); // Store connected users and their socket IDs
let isUpdating=false
io.on('connection', (socket) => {
  socket.on('joinRoom', ({ roomId, username, email }) => {
    // Check if the user is already connected
    const existingSocketId = connectedUsers.get(email);
    if (existingSocketId) {
      // User is already connected, update their socket ID
      connectedUsers.set(email, socket.id);
      // Find the room and update the user's socket ID
      const room = rooms.get(roomId);
      if (room) {
        const userIndex = room.findIndex((user) => user.email === email);
        if (userIndex !== -1) {
          room[userIndex].id = socket.id;
          rooms.set(roomId, room);
          socket.join(roomId);
        }
      }
      console.log("existing user",rooms)
      return;
    }

    // Add the user to the room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }
    const room = rooms.get(roomId);
    room.push({ id: socket.id, user: username, email: email });
    rooms.set(roomId, room);
    socket.join(roomId);
    // Add the user to the connected users map
    connectedUsers.set(email, socket.id);
    // Emit event to update clients
    const roomUsers = room.map((user) => user.user);

    io.to(roomId).emit('updateUsers', roomUsers);

    // Emit event to notify clients about the new user
    io.to(roomId).emit('userJoined', username);
    console.log("new user",rooms)
  });

  socket.on('nodeUpdates',({nodes,roomId,username,email})=>{
    console.log(roomId)
    console.log(username)
    console.log(email)
    console.log(nodes)
    // if (!isUpdating) { // Check if updates are currently being processed
    //   isUpdating = true; // Set the flag to indicate that updates are in progress
    //   // Emit an event to inform all clients that updates are in progress
    //   io.to(roomId).emit('updatesInProgress', true);

    //   // Process node updates here...
      io.to(roomId).emit('updateNodes',{nodes,email})
      // // After processing updates, emit an event to inform all clients that updates are complete
      // io.to(roomId).emit('updatesComplete', false);
      // isUpdating = false; // Reset the flag to indicate that updates are complete
  //}

  })

  socket.on('disconnect', () => {
    // Remove the user from the connected users map
    const email = Array.from(connectedUsers.entries()).find(([_, socketId]) => socketId === socket.id)?.[0];
    if (email) {
      connectedUsers.delete(email);

      // Remove the user from all rooms
      for (const [roomId, room] of rooms.entries()) {
        const updatedRoom = room.filter((user) => user.email !== email);
        if (updatedRoom.length !== room.length) {
          const olduser = room.filter((user) => user.email === email)[0].user
          if(updatedRoom.length===0){
            rooms.delete(roomId);
          }
          else{
            rooms.set(roomId, updatedRoom);
          }
          console.log("old user",rooms)
          io.to(roomId).emit('updateUsers', updatedRoom.map((user) => user.user))
          io.to(roomId).emit('userLeft', olduser);
        }
      }
      socket.rooms.forEach(roomId => {
        socket.leave(roomId);
      });
    }
  });
});
  