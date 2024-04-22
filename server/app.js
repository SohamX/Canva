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

app.use(cors());
app.use(express.json());

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
        if (!room.users) {
          room.users = [];
          room.users.push({ id: socket.id, user: username, email: email });
          rooms.set(roomId, room);
          socket.join(roomId);
        }
        else{
          const userIndex = room.user.findIndex((user) => user.email === email);
          if (userIndex !== -1) {
            room.user[userIndex].id = socket.id;
            rooms.set(roomId, room);
            socket.join(roomId);
          }
        }
      }
      console.log("existing user",rooms)
      return;
    }

    // Add the user to the room
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {users: []});
    }
    let room = rooms.get(roomId);
    room.users.push({ id: socket.id, user: username, email: email });
    rooms.set(roomId, room);
    socket.join(roomId);
    // Add the user to the connected users map
    connectedUsers.set(email, socket.id);
    // Emit event to update clients
    const roomUsers = room.users.map((user) => user.user);

    io.to(roomId).emit('updateUsers', roomUsers);

    // Emit event to notify clients about the new user
    io.to(roomId).emit('userJoined', username);
    console.log("new user",rooms)
  });

  socket.on('nodeUpdates',({myNode,roomId,username,email,operation})=>{
    console.log(roomId)
    console.log(username)
    console.log(email)
    console.log(myNode)
    console.log(operation)
    //   // Process node updates here...
    const id = myNode.id;
    switch (operation) {
      case 'adding':
        // Handle adding operation
        // const room = rooms.get(roomId);
        // const userIndex = room.findIndex((user) => user.email === email);
        // if (userIndex !== -1) {
        //   room[userIndex].myNode = myNode;
        //   rooms.set(roomId, room);
        // }
        // console.log("adding node",rooms)
        io.to(roomId).emit('addingNode', { myNode, email, username });
        break;
      case 'dragging':
        // Handle dragging operation
        const position = myNode.position;
        io.to(roomId).emit('draggingNode', { id, position, email, username });
        break;
      case 'deleting':
        // Handle dropping operation
        io.to(roomId).emit('deletingNode', { id, email, username });
        break;
      case 'resizing':
        // Handle resizing operation
        const style = myNode.style;
        const width = myNode.width;
        const height = myNode.height;
        io.to(roomId).emit('resizingNode', { id, style, width, height, email, username });
      case 'updatingLabel':
        // Handle updating operation
        const label = myNode.data.label;
        io.to(roomId).emit('updatingLabelNode', { id, label, email, username });
        break;
      case 'updatingTextColor':
        // Handle updating operation
        const textColor = myNode.data.textColor;
        io.to(roomId).emit('updatingTextColor', { id, textColor, email, username });
        break;
      case 'updatingBgColor':
        // Handle updating operation
        const backgroundColor = myNode.data.backgroundColor;
        io.to(roomId).emit('updatingBgColor', { id, backgroundColor, email, username });
        break;  
      default:
        // Handle unknown operation
        console.log(`Unknown operation: ${operation}`);
        break;
    }
  })

  socket.on('selectedNodesUpdates',({mySelectedNodes,roomId,username,email,operation})=>{
    console.log(roomId)
    console.log(username)
    console.log(email)
    console.log(mySelectedNodes, "selected nodes")
    console.log(operation)
    //   // Process node updates here...
    const ids = mySelectedNodes.map((node) => node.id);
    switch (operation) {
      case 'dragging':
        // Handle dragging operation
        const positions = mySelectedNodes.map((node) => node.position);
        io.to(roomId).emit('draggingSelectedNodes', { ids, positions, email, username });
        break;
      case 'deleting':
        // Handle dropping operation
        io.to(roomId).emit('deletingSelectedNodes', { ids, email, username });
        break;
      default:
        // Handle unknown operation
        console.log(`Unknown operation: ${operation}`);
        break;
    }
  })

  socket.on('edgeUpdates',({myEdge,roomId,username,email,operation})=>{
    console.log(roomId)
    console.log(username)
    console.log(email)
    console.log(myEdge)
    console.log(operation)
    //   // Process node updates here...
    if(!myEdge){
      console.log("empty edge")
      return;
    }
    if(myEdge.source===myEdge.target){
      console.log("self loop")
      return;
    }
    const id = myEdge.id;
    switch (operation) {
      case 'adding':
        // Handle adding operation
        io.to(roomId).emit('addingEdge', { myEdge, email, username });
        break;
      case 'deleting':
        // Handle dropping operation
        io.to(roomId).emit('deletingEdge', { id, email, username });
        break;
      default:
        // Handle unknown operation
        console.log(`Unknown operation: ${operation}`);
        break;
    }
  })

  socket.on('selectedEdgesUpdates',({mySelectedEdges,roomId,username,email,operation})=>{
    console.log(roomId)
    console.log(username)
    console.log(email)
    console.log(mySelectedEdges, "selected edges")
    console.log(operation)
    //   // Process node updates here...
    const ids = mySelectedEdges.map((edge) => edge.id);
    switch (operation) {
      case 'deleting':
        // Handle dropping operation
        io.to(roomId).emit('deletingSelectedEdges', { ids, email, username });
        break;
      case 'colouring':
        // Handle dropping operation
        console.log("colouring edges")
        // const color = mySelectedEdges[0].style.stroke;
        // io.to(roomId).emit('colouringSelectedEdges', { ids, color, email, username });
        break;
      case 'textcolouring':
        // Handle dropping operation
        console.log("text colouring edges")
        // const textColor = mySelectedEdges[0].style.label.style.stroke;
        // io.to(roomId).emit('textcolouringSelectedEdges', { ids, textColor, email, username });
        break;
      default:
        // Handle unknown operation
        console.log(`Unknown operation: ${operation}`);
        break;
    }
  })

  socket.on('disconnect', () => {
    const email = Array.from(connectedUsers.entries()).find(([_, socketId]) => socketId === socket.id)?.[0];
    if (email) {
      connectedUsers.delete(email);
      for (const [roomId, room] of rooms.entries()) {
        if(room.users){
          const updatedRoom = room.users.filter((user) => user.email !== email);
          if (updatedRoom.length !== room.users.length) {
            const olduser = room.users.filter((user) => user.email === email)[0].user
            if(updatedRoom.length===0){
              rooms.delete(roomId);
            }
            else{
              //rooms.set(roomId, updatedRoom);
              room.users = updatedRoom;
              rooms.set(roomId, room);
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
    }
  });
});
  