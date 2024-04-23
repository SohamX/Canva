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
const connectedUsers = new Map();

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
      rooms.set(roomId, {users: [], edges: [], nodes: [  {
        id: "1",
        position: { x: 100, y: 100 },
        data: { label: "Node 1", forceToolbarVisible: false, textColor: '#000000', backgroundColor: '#FFFFFF'},
        type: "resizeRotate",
    
      },
      {
        id: "2",
        position: { x: 100, y: 400 },
        data: { label: "Node 2", forceToolbarVisible: false, textColor: '#000000', backgroundColor: '#FFFFFF' },
        type: "resizeRotate",
    
      }]});
    }
    let room = rooms.get(roomId);
    room.users.push({ id: socket.id, user: username, email: email });
    rooms.set(roomId, room);
    socket.join(roomId);
    // Add the user to the connected users map
    connectedUsers.set(email, socket.id);
    // Emit event to update clients
    const roomUsers = room.users.map((user) => user.user);
    socket.emit('initialData', { nodes: room.nodes, edges: room.edges, email})
    io.to(roomId).emit('updateUsers', roomUsers);

    // Emit event to notify clients about the new user
    io.to(roomId).emit('userJoined', username);
    console.log("new user",rooms)
  });

  socket.on('nodeUpdates',({myNode,roomId,username,email,operation})=>{
    //for single node updates
    const id = myNode.id;
    let room = rooms.get(roomId);
    if (!room) return;
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
        room.nodes.push(myNode);
        io.to(roomId).emit('addingNode', { myNode, email, username });
        break;
      case 'dragging':
        // Handle dragging operation
        const position = myNode.position;
        room.nodes = room.nodes.map((node) => node.id === id ? { ...node, position } : node);
        io.to(roomId).emit('draggingNode', { id, position, email, username });
        break;
      case 'deleting':
        // Handle dropping operation
        room.nodes = room.nodes.filter((node) => node.id !== id);
        io.to(roomId).emit('deletingNode', { id, email, username });
        break;
      case 'resizing':
        // Handle resizing operation
        const width = myNode.width;
        const height = myNode.height;
        room.nodes = room.nodes.map((node) => node.id === id ? { ...node, width, height } : node);
        io.to(roomId).emit('resizingNode', { id, width, height, email, username });
      case 'updatingLabel':
        // Handle updating operation
        const label = myNode.data.label;
        room.nodes = room.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, label } } : node);
        io.to(roomId).emit('updatingLabelNode', { id, label, email, username });
        break;
      case 'updatingTextColor':
        // Handle updating operation
        const textColor = myNode.data.textColor;
        room.nodes = room.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, textColor } } : node);
        io.to(roomId).emit('updatingTextColor', { id, textColor, email, username });
        break;
      case 'updatingBgColor':
        // Handle updating operation
        const backgroundColor = myNode.data.backgroundColor;
        room.nodes = room.nodes.map((node) => node.id === id ? { ...node, data: { ...node.data, backgroundColor } } : node);
        io.to(roomId).emit('updatingBgColor', { id, backgroundColor, email, username });
        break;  
      default:
        // Handle unknown operation
        console.log(`Unknown operation: ${operation}`);
        break;
    }
    rooms.set(roomId, room);
    console.dir(rooms, { depth: null })
  })

  socket.on('selectedNodesUpdates',({mySelectedNodes,roomId,username,email,operation})=>{
    //for multiple node updates
    const ids = mySelectedNodes.map((node) => node.id);
    let room = rooms.get(roomId);
    switch (operation) {
      case 'dragging':
        // Handle dragging operation
        const positions = mySelectedNodes.map((node) => node.position);
        room.nodes = room.nodes.map((node) =>{ 
          const index = ids.indexOf(node.id);
          if (index !== -1) {
            return { ...node, position: positions[index] };
          }
          return node
        })
        io.to(roomId).emit('draggingSelectedNodes', { ids, positions, email, username });
        break;
      case 'deleting':
        // Handle dropping operation
        room.nodes = room.nodes.filter((node) => !ids.includes(node.id));  
        io.to(roomId).emit('deletingSelectedNodes', { ids, email, username });
        break;
      case 'import':
        // Handle importing operation
        room.nodes = mySelectedNodes
        io.to(roomId).emit('importingNodes', { mySelectedNodes, email, username });
        break;
      default:
        // Handle unknown operation
        console.log(`Unknown operation: ${operation}`);
        break;
    }
    rooms.set(roomId, room);
  })

  socket.on('edgeUpdates',({myEdge,roomId,username,email,operation})=>{
    //for single edge updates
    if(!myEdge){
      console.log("empty edge")
      return;
    }
    if(myEdge.source===myEdge.target){
      console.log("self loop")
      return;
    }
    const id = myEdge.id;
    const room = rooms.get(roomId);
    switch (operation) {
      case 'adding':
        room.edges.push(myEdge);
        io.to(roomId).emit('addingEdge', { myEdge, email, username });
        break;
      case 'deleting':
        room.edges = room.edges.filter((edge) => edge.id !== id);
        io.to(roomId).emit('deletingEdge', { id, email, username });
        break;
      default:
        console.log(`Unknown operation: ${operation}`);
        break;
    }
    rooms.set(roomId, room);
  })

  socket.on('selectedEdgesUpdates',({mySelectedEdges,roomId,username,email,operation})=>{
    // Multiple edge updates here...
    const ids = mySelectedEdges.map((edge) => edge.id);
    const room = rooms.get(roomId);
    switch (operation) {
      case 'deleting':
        // Handle dropping operation
        room.edges = room.edges.filter((edge) => !ids.includes(edge.id));
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
      case 'import':
        // Handle importing operation
        room.edges = mySelectedEdges
        io.to(roomId).emit('importingEdges', { mySelectedEdges, email, username });
        break;
      default:
        // Handle unknown operation
        console.log(`Unknown operation: ${operation}`);
        break;
    }
    rooms.set(roomId, room);
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
  