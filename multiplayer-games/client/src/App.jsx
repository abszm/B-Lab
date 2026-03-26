import { Routes, Route, Link } from 'react-router-dom';
import Lobby from './components/Lobby';
import GobangGame from './games/gobang';
import LandlordGame from './games/landlord';
import './App.css';

function App() {
  return (
    <div className="app">
      <nav className="nav">
        <h1>多人对战游戏平台</h1>
      </nav>
      <main className="main">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/gobang/:roomId?" element={<GobangGame />} />
          <Route path="/landlord/:roomId?" element={<LandlordGame />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
