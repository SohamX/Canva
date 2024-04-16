import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = ({setUsername,username,setEmail,email}) => {
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    const storedEmail = localStorage.getItem('email');
    if (storedUsername) {
      setUsername(storedUsername);
    }
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const handleCreateRoom = () => {
    // TODO: Generate room ID
    const newRoomId = Math.random().toString(36).substring(2, 6)
    navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    navigate(`/room/${roomId}`);
  };

  useEffect(() => {
    localStorage.setItem('username', username);
    localStorage.setItem('email', email);
  }, [username,email]);

  return (
      <div className="bg-white bg-opacity-10 p-8 rounded-lg shadow-lg w-1/2">
      <h1 className="text-3xl font-bold mb-6 text-white">Welcome to the Collaborative Whiteboard</h1>
      <input
        type="text"
        placeholder="Enter your username"
        value={username}
        onChange={(e) => setUsername(e.target.value.trim())}
        className="px-4 py-2 rounded-md mb-4 w-full"
      />
      <input
        type="text"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value.trim())}
        className="px-4 py-2 rounded-md mb-4 w-full"
      />
      <div className="flex justify-center">
        <button onClick={handleCreateRoom} className="bg-white text-purple-500 font-bold py-2 px-4 rounded-md mr-2">
          Create New Room
        </button>
        <input
          type="text"
          placeholder="Enter room ID"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value.trim())}
          className="px-4 py-2 rounded-md mr-2"
        />
        <button onClick={handleJoinRoom} className="bg-white text-purple-500 font-bold py-2 px-4 rounded-md">
          Join Room
        </button>
      </div>
    </div>
  );
};

export default LandingPage;