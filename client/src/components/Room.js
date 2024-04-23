import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import Whiteboard from './Whiteboard.js';
import Userlist from './Userlist.js';
import { ReactFlowProvider } from 'reactflow';
//import Chat from './Chat';

const Room = ({setUsername, username, setEmail, email}) => {
  const { roomId } = useParams();
  const [users, setUsers] = useState([]);
  const ENDPOINT = 'http://localhost:3000'
  const navigate = useNavigate();
  const [socket, setSocket] = useState(null);
  
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
    //add a socket function to check if the room exists
  }, [ setUsername, setEmail]);

  useEffect(() => {
    const newSocket = io(ENDPOINT);
    newSocket.on('connect', () => {
      // Emit the 'joinRoom' event to inform the server about the user joining
      newSocket.emit('joinRoom', { roomId, username, email });
    });
    // Update the user list 
    newSocket.on('updateUsers', (roomUsers) => {
      setUsers(roomUsers);
    });
    // Display an alert when a user leaves
    newSocket.on('userLeft', (oldUser) => {
      window.alert(`${oldUser} left the room`);
    });
    newSocket.on('userJoined', (newUser) => {
      if(username!==newUser){
        window.alert(`${newUser} joined the room`);
      }
    });
    setSocket(newSocket);
    return () => {
      newSocket.disconnect();
    };

  }, [roomId, username, email]);
  
  return (
    <div className="relative h-full w-full overflow-hidden">
      {users.length > 0 && <Userlist users={users} />}
      <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-1">
        <h1 className="text-2xl font-bold">Room: {roomId}</h1>
      </div>
      {socket ? (
      <ReactFlowProvider>
      <Whiteboard socket={socket} roomId={roomId} username={username} email={email} />
      </ReactFlowProvider>
      ):null}
      <button onClick={() => navigate(-1)} className="fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Back
      </button>
    </div>
  );
};

export default Room;