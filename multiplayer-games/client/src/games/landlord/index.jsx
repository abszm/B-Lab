import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { CardHand } from './components/CardHand';
import PlayArea from './components/PlayArea';
import PlayerPanel from './components/PlayerPanel';
import BidPanel from './components/BidPanel';
import BottomCards from './components/BottomCards';
import GameResult from './components/GameResult';
import './landlord.css';

const socket = io();

function LandlordGame() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [gameState, setGameState] = useState({
    roomId: roomId || null,
    position: null,
    status: 'connecting',
    players: [null, null, null],
    hands: [[], [], []],
    bottomCards: [],
    landlordIndex: null,
    currentCaller: null,
    currentPlayer: null,
    lastPlayedCards: null,
    winner: null,
    error: ''
  });

  useEffect(() => {
    if (roomId) {
      socket.emit('landlord:join-room', { roomId });
    }

    socket.on('landlord:room-created', ({ roomId, position }) => {
      setGameState(prev => ({ 
        ...prev, 
        roomId, 
        position,
        status: 'waiting' 
      }));
    });

    socket.on('landlord:room-joined', ({ room, position }) => {
      setGameState(prev => ({
        ...prev,
        roomId: room.roomId,
        position,
        status: room.status === 'dealing' || room.status === 'calling' || room.status === 'playing' 
          ? 'playing' : 'waiting',
        players: room.players,
        hands: room.hands,
        bottomCards: room.bottomCards,
        landlordIndex: room.landlordIndex,
        currentCaller: room.currentCaller,
        currentPlayer: room.currentPlayer,
        lastPlayedCards: room.lastPlayedCards
      }));
    });

    socket.on('landlord:game-start', () => {
      setGameState(prev => ({ ...prev, status: 'playing' }));
    });

    socket.on('landlord:cards-dealt', ({ handCards }) => {
      setGameState(prev => ({
        ...prev,
        hands: handCards,
        currentCaller: 0
      }));
    });

    socket.on('landlord:call-turn', ({ currentCaller }) => {
      setGameState(prev => ({ ...prev, currentCaller }));
    });

    socket.on('landlord:call-made', ({ player, bid }) => {
      setGameState(prev => {
        const newState = { ...prev };
        return newState;
      });
    });

    socket.on('landlord:landlord-selected', ({ landlordIndex, bottomCards }) => {
      setGameState(prev => {
        const newHands = [...prev.hands];
        newHands[landlordIndex] = [...newHands[landlordIndex], ...bottomCards].sort((a, b) => {
          const values = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
            'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15, 'small_joker': 16, 'big_joker': 17 };
          return (values[b.replace(/s|h|d|c/, '')] || 0) - (values[a.replace(/s|h|d|c/, '')] || 0);
        });
        return {
          ...prev,
          landlordIndex,
          bottomCards,
          hands: newHands
        };
      });
    });

    socket.on('landlord:play-turn', ({ currentPlayer }) => {
      setGameState(prev => ({ 
        ...prev, 
        currentPlayer,
        lastPlayedCards: null 
      }));
    });

    socket.on('landlord:cards-played', ({ player, cards }) => {
      setGameState(prev => {
        const newHands = [...prev.hands];
        newHands[player] = newHands[player].filter(c => !cards.includes(c));
        return {
          ...prev,
          hands: newHands,
          lastPlayedCards: { player, cards }
        };
      });
    });

    socket.on('landlord:pass-made', ({ player }) => {
      setGameState(prev => ({ ...prev }));
    });

    socket.on('landlord:game-over', ({ winner }) => {
      setGameState(prev => ({
        ...prev,
        status: 'ended',
        winner
      }));
    });

    socket.on('landlord:error', ({ message }) => {
      setGameState(prev => ({ ...prev, error: message }));
    });

    socket.on('landlord:player-joined', ({ position }) => {
      setGameState(prev => ({ ...prev, error: '有玩家加入了' }));
    });

    return () => {
      socket.off('landlord:room-created');
      socket.off('landlord:room-joined');
      socket.off('landlord:game-start');
      socket.off('landlord:cards-dealt');
      socket.off('landlord:call-turn');
      socket.off('landlord:call-made');
      socket.off('landlord:landlord-selected');
      socket.off('landlord:play-turn');
      socket.off('landlord:cards-played');
      socket.off('landlord:pass-made');
      socket.off('landlord:game-over');
      socket.off('landlord:error');
      socket.off('landlord:player-joined');
    };
  }, [roomId]);

  const handleBid = useCallback((bid) => {
    socket.emit('landlord:call-bid', { bid });
  }, []);

  const handlePlayCards = useCallback((cards) => {
    socket.emit('landlord:play-cards', { cards });
  }, []);

  const handlePass = useCallback(() => {
    socket.emit('landlord:pass');
  }, []);

  const handleLeave = () => {
    socket.emit('landlord:leave-room');
    navigate('/');
  };

  const handlePlayAgain = () => {
    socket.emit('landlord:create-room');
    setGameState(prev => ({
      ...prev,
      status: 'connecting',
      hands: [[], [], []],
      bottomCards: [],
      landlordIndex: null,
      currentCaller: null,
      currentPlayer: null,
      lastPlayedCards: null,
      winner: null
    }));
  };

  if (gameState.status === 'connecting') {
    return (
      <div className="landlord-loading">
        <p>{roomId ? '正在加入房间...' : '正在创建房间...'}</p>
      </div>
    );
  }

  const myHand = gameState.position !== null ? gameState.hands[gameState.position] : [];
  const isMyTurnToCall = gameState.currentCaller === gameState.position;
  const isMyTurnToPlay = gameState.currentPlayer === gameState.position;

  return (
    <div className="landlord-game">
      <div className="game-header">
        <button className="btn-leave" onClick={handleLeave}>返回大厅</button>
        <h2>房间号: {gameState.roomId}</h2>
      </div>

      <div className="game-table">
        <div className="player-area top">
          <PlayerPanel 
            player={gameState.players[1]} 
            handCount={gameState.hands[1]?.length || 0}
            isLandlord={gameState.landlordIndex === 1}
            isCurrentPlayer={gameState.currentPlayer === 1}
            position={1}
          />
        </div>

        <div className="middle-area">
          <div className="player-area left">
            <PlayerPanel 
              player={gameState.players[0]} 
              handCount={gameState.hands[0]?.length || 0}
              isLandlord={gameState.landlordIndex === 0}
              isCurrentPlayer={gameState.currentPlayer === 0}
              position={0}
            />
          </div>

          <div className="center-area">
            {gameState.bottomCards.length > 0 && (
              <BottomCards cards={gameState.bottomCards} />
            )}
            
            <PlayArea 
              lastPlayedCards={gameState.lastPlayedCards}
              isMyTurn={isMyTurnToPlay}
              onPlayCards={handlePlayCards}
              onPass={handlePass}
            />

            {gameState.landlordIndex === null && isMyTurnToCall && (
              <BidPanel 
                currentBid={0}
                onBid={handleBid}
              />
            )}
          </div>

          <div className="player-area right">
            <PlayerPanel 
              player={gameState.players[2]} 
              handCount={gameState.hands[2]?.length || 0}
              isLandlord={gameState.landlordIndex === 2}
              isCurrentPlayer={gameState.currentPlayer === 2}
              position={2}
            />
          </div>
        </div>

        <div className="player-area bottom">
          {gameState.position !== null && (
            <CardHand 
              cards={myHand}
              isMyHand={true}
            />
          )}
        </div>
      </div>

      {gameState.status === 'waiting' && (
        <div className="waiting-overlay">
          <div className="waiting-content">
            <p>等待其他玩家加入...</p>
            <p className="room-id">房间号: {gameState.roomId}</p>
            <p className="player-count">已加入: {gameState.players.filter(p => p).length}/3</p>
            <button className="btn-leave" onClick={handleLeave}>取消</button>
          </div>
        </div>
      )}

      {gameState.status === 'ended' && (
        <GameResult 
          winner={gameState.winner}
          myPosition={gameState.position}
          landlordIndex={gameState.landlordIndex}
          onPlayAgain={handlePlayAgain}
          onLeave={handleLeave}
        />
      )}

      {gameState.error && (
        <div className="error-toast">
          <span>{gameState.error}</span>
          <button onClick={() => setGameState(prev => ({ ...prev, error: '' }))}>关闭</button>
        </div>
      )}
    </div>
  );
}

export default LandlordGame;
