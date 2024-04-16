// import logo from './logo.svg';
// import './App.css';

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

// export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './components/Landing';
import Room from './components/Room';

const App = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail]=useState('');
  return (
    <Router>
      <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-purple-500 to-indigo-500">

          <Routes>
            <Route path="/" element={<LandingPage setUsername={setUsername} username={username} setEmail={setEmail} email={email}/>} />
            <Route path="/room/:roomId" element={<Room setUsername={setUsername} username={username} setEmail={setEmail} email={email} />} />
          </Routes>
      </div>
    </Router>
  );
};

export default App;