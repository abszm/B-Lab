import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import './Lobby.css';

const socket = io();

function Lobby() {
  const navigate = useNavigate();
  const [roomId, setRoomId] = useState('');
  const [currentGame, setCurrentGame] = useState(null);
  const [error, setError] = useState('');

  const createRoom = (game) => {
    setCurrentGame(game);
    socket.emit(`${game}:create-room`);
  };

  const joinRoom = (game) => {
    if (!roomId.trim()) {
      setError('请输入房间号');
      return;
    }
    setCurrentGame(game);
    socket.emit(`${game}:join-room`, { roomId: roomId.trim() });
  };

  socket.on(`${currentGame}:room-created`, ({ roomId }) => {
    navigate(`/${currentGame}/${roomId}`);
  });

  socket.on(`${currentGame}:room-joined`, ({ room }) => {
    navigate(`/${currentGame}/${room.roomId}`);
  });

  socket.on(`${currentGame}:error`, ({ message }) => {
    setError(message);
    setCurrentGame(null);
  });

  return (
    <div className="lobby">
      <div className="game-cards">
        <div className="game-card gobang">
          <h2>五子棋</h2>
          <p className="game-desc">经典双人策略游戏</p>
          <p className="game-players">2人对战</p>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={() => createRoom('gobang')}>
              创建房间
            </button>
            <div className="join-form">
              <input
                type="text"
                placeholder="输入房间号"
                value={currentGame === 'gobang' ? '' : roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={currentGame !== null}
              />
              <button
                className="btn btn-secondary"
                onClick={() => joinRoom('gobang')}
                disabled={currentGame !== null}
              >
                加入
              </button>
            </div>
          </div>
        </div>

        <div className="game-card landlord">
          <h2>斗地主</h2>
          <p className="game-desc">经典三人纸牌游戏</p>
          <p className="game-players">3人对战</p>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={() => createRoom('landlord')}>
              创建房间
            </button>
            <div className="join-form">
              <input
                type="text"
                placeholder="输入房间号"
                value={currentGame === 'landlord' ? '' : roomId}
                onChange={(e) => setRoomId(e.target.value)}
                disabled={currentGame !== null}
              />
              <button
                className="btn btn-secondary"
                onClick={() => joinRoom('landlord')}
                disabled={currentGame !== null}
              >
                加入
              </button>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={() => setError('')}>关闭</button>
        </div>
      )}
    </div>
  );
}

export default Lobby;
