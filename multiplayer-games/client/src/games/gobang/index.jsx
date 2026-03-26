import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Board from './components/Board';
import PlayerInfo from './components/PlayerInfo';
import GameResult from './components/GameResult';
import './gobang.css';

const socket = io();

function GobangGame() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    roomId: roomId || null,
    role: null,
    status: 'connecting',
    board: Array(15).fill(null).map(() => Array(15).fill(0)),
    currentTurn: 0,
    winner: null,
    players: [null, null],
    error: ''
  });

  useEffect(() => {
    if (roomId) {
      socket.emit('gobang:join-room', { roomId });
    }

    socket.on('gobang:room-created', ({ roomId, role }) => {
      setGameState(prev => ({ ...prev, roomId, role, status: 'waiting' }));
    });

    socket.on('gobang:room-joined', ({ room, role }) => {
      setGameState(prev => ({
        ...prev,
        roomId: room.roomId,
        role,
        status: room.status === 'playing' ? 'playing' : 'waiting',
        board: room.board,
        currentTurn: room.currentTurn,
        players: room.players
      }));
    });

    socket.on('gobang:game-start', ({ board, currentTurn }) => {
      setGameState(prev => ({
        ...prev,
        status: 'playing',
        board,
        currentTurn
      }));
    });

    socket.on('gobang:move-made', ({ x, y, player, board, currentTurn }) => {
      setGameState(prev => ({
        ...prev,
        board: [...board],
        currentTurn
      }));
    });

    socket.on('gobang:game-over', ({ winner, reason }) => {
      setGameState(prev => ({
        ...prev,
        status: 'ended',
        winner
      }));
    });

    socket.on('gobang:error', ({ message }) => {
      setGameState(prev => ({ ...prev, error: message }));
    });

    socket.on('gobang:player-joined', () => {
      setGameState(prev => ({ ...prev, error: '等待其他玩家...' }));
    });

    return () => {
      socket.off('gobang:room-created');
      socket.off('gobang:room-joined');
      socket.off('gobang:game-start');
      socket.off('gobang:move-made');
      socket.off('gobang:game-over');
      socket.off('gobang:error');
      socket.off('gobang:player-joined');
    };
  }, [roomId]);

  const handleCellClick = useCallback((x, y) => {
    if (gameState.status !== 'playing') return;
    if (gameState.currentTurn !== (gameState.role === 'black' ? 0 : 1)) return;
    
    socket.emit('gobang:make-move', { x, y });
  }, [gameState.status, gameState.currentTurn, gameState.role]);

  const handleLeave = () => {
    socket.emit('gobang:leave-room');
    navigate('/');
  };

  const handlePlayAgain = () => {
    socket.emit('gobang:create-room');
    setGameState(prev => ({
      ...prev,
      status: 'connecting',
      board: Array(15).fill(null).map(() => Array(15).fill(0)),
      currentTurn: 0,
      winner: null
    }));
  };

  if (gameState.status === 'connecting') {
    return (
      <div className="gobang-loading">
        <p>{roomId ? '正在加入房间...' : '正在创建房间...'}</p>
      </div>
    );
  }

  const isMyTurn = gameState.status === 'playing' && 
    gameState.currentTurn === (gameState.role === 'black' ? 0 : 1);

  return (
    <div className="gobang-game">
      <div className="game-header">
        <button className="btn-leave" onClick={handleLeave}>返回大厅</button>
        <h2>房间号: {gameState.roomId}</h2>
      </div>

      <div className="game-content">
        <PlayerInfo 
          player={gameState.players[0]} 
          label="黑棋" 
          isCurrentTurn={gameState.currentTurn === 0}
          isMe={gameState.role === 'black'}
        />
        
        <Board
          board={gameState.board}
          onCellClick={handleCellClick}
          lastMove={gameState.lastMove}
        />
        
        <PlayerInfo 
          player={gameState.players[1]} 
          label="白棋" 
          isCurrentTurn={gameState.currentTurn === 1}
          isMe={gameState.role === 'white'}
        />
      </div>

      {gameState.status === 'waiting' && (
        <div className="waiting-overlay">
          <div className="waiting-content">
            <p>等待其他玩家加入...</p>
            <p className="room-id">房间号: {gameState.roomId}</p>
            <button className="btn-leave" onClick={handleLeave}>取消</button>
          </div>
        </div>
      )}

      {gameState.status === 'playing' && (
        <div className="turn-indicator">
          {isMyTurn ? '轮到你了' : '等待对方...'}
        </div>
      )}

      {gameState.status === 'ended' && (
        <GameResult 
          winner={gameState.winner} 
          myRole={gameState.role}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}

      {gameState.error && (
        <div className="error-toast">
          <span>{gameState.error}</span>
        </div>
      )}
    </div>
  );
}

export default GobangGame;
