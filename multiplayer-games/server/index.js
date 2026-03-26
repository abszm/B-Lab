const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const GobangRoom = require('./games/gobang/GameRoom');
const LandlordRoom = require('./games/landlord/GameRoom');

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const rooms = {
  gobang: new Map(),
  landlord: new Map()
};

app.post('/api/rooms/:game/create', (req, res) => {
  const { game } = req.params;
  const roomId = generateRoomId();
  
  if (!rooms[game]) {
    return res.status(400).json({ error: 'Unknown game' });
  }
  
  const room = game === 'gobang' 
    ? new GobangRoom(roomId)
    : new LandlordRoom(roomId);
  
  rooms[game].set(roomId, room);
  res.json({ roomId });
});

app.get('/api/rooms/:game/:roomId', (req, res) => {
  const { game, roomId } = req.params;
  const roomMap = rooms[game];
  
  if (!roomMap) {
    return res.status(400).json({ error: 'Unknown game' });
  }
  
  const room = roomMap.get(roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  
  res.json({ 
    roomId: room.roomId, 
    status: room.status,
    playerCount: room.getPlayerCount()
  });
});

function generateRoomId() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('gobang:create-room', () => {
    const roomId = generateRoomId();
    const room = new GobangRoom(roomId);
    rooms.gobang.set(roomId, room);
    
    const player = { id: socket.id, socketId: socket.id, role: 'black', status: 'online' };
    room.addPlayer(player);
    socket.join(roomId);
    socket.gameRoomId = roomId;
    socket.gameType = 'gobang';
    
    socket.emit('gobang:room-created', { roomId, role: 'black' });
    console.log(`Gobang room ${roomId} created`);
  });
  
  socket.on('gobang:join-room', ({ roomId }) => {
    const room = rooms.gobang.get(roomId);
    if (!room) {
      socket.emit('gobang:error', { message: 'Room not found' });
      return;
    }
    
    if (room.getPlayerCount() >= 2) {
      socket.emit('gobang:error', { message: 'Room is full' });
      return;
    }
    
    const player = { id: socket.id, socketId: socket.id, role: 'white', status: 'online' };
    room.addPlayer(player);
    socket.join(roomId);
    socket.gameRoomId = roomId;
    socket.gameType = 'gobang';
    
    socket.emit('gobang:room-joined', { room: room.getState(), role: 'white' });
    socket.to(roomId).emit('gobang:player-joined', { position: 1 });
    
    if (room.getPlayerCount() === 2) {
      room.startGame();
      io.to(roomId).emit('gobang:game-start', {
        board: room.board,
        currentTurn: room.currentTurn
      });
    }
  });
  
  socket.on('gobang:make-move', ({ x, y }) => {
    const room = rooms.gobang.get(socket.gameRoomId);
    if (!room) return;
    
    const result = room.makeMove(socket.id, x, y);
    if (result.success) {
      io.to(socket.gameRoomId).emit('gobang:move-made', {
        x, y,
        player: result.player,
        board: room.board,
        currentTurn: room.currentTurn
      });
      
      if (room.winner !== null) {
        io.to(socket.gameRoomId).emit('gobang:game-over', {
          winner: room.winner,
          reason: room.winner === 0 ? 'black' : 'white'
        });
        rooms.gobang.delete(socket.gameRoomId);
      }
    } else {
      socket.emit('gobang:error', { message: result.error });
    }
  });
  
  socket.on('gobang:leave-room', () => {
    handleLeave('gobang', socket);
  });
  
  socket.on('landlord:create-room', () => {
    const roomId = generateRoomId();
    const room = new LandlordRoom(roomId);
    rooms.landlord.set(roomId, room);
    
    const position = room.addPlayer({ id: socket.id, socketId: socket.id, status: 'online' });
    socket.join(roomId);
    socket.gameRoomId = roomId;
    socket.gameType = 'landlord';
    
    socket.emit('landlord:room-created', { roomId, position });
    console.log(`Landlord room ${roomId} created`);
  });
  
  socket.on('landlord:join-room', ({ roomId }) => {
    const room = rooms.landlord.get(roomId);
    if (!room) {
      socket.emit('landlord:error', { message: 'Room not found' });
      return;
    }
    
    if (room.getPlayerCount() >= 3) {
      socket.emit('landlord:error', { message: 'Room is full' });
      return;
    }
    
    const position = room.addPlayer({ id: socket.id, socketId: socket.id, status: 'online' });
    socket.join(roomId);
    socket.gameRoomId = roomId;
    socket.gameType = 'landlord';
    
    socket.emit('landlord:room-joined', { room: room.getState(), position });
    socket.to(roomId).emit('landlord:player-joined', { position });
    
    if (room.getPlayerCount() === 3) {
      room.startGame();
      io.to(roomId).emit('landlord:game-start');
      io.to(roomId).emit('landlord:cards-dealt', { handCards: room.hands });
    }
  });
  
  socket.on('landlord:call-bid', ({ bid }) => {
    const room = rooms.landlord.get(socket.gameRoomId);
    if (!room) return;
    
    const result = room.callBid(socket.id, bid);
    if (result.success) {
      io.to(socket.gameRoomId).emit('landlord:call-made', {
        player: result.player,
        bid
      });
      
      if (room.landlordIndex !== null) {
        io.to(socket.gameRoomId).emit('landlord:landlord-selected', {
          landlordIndex: room.landlordIndex,
          bottomCards: room.bottomCards
        });
        room.startPlaying();
        io.to(socket.gameRoomId).emit('landlord:play-turn', {
          currentPlayer: room.currentPlayer
        });
      } else if (result.nextCaller !== undefined) {
        io.to(socket.gameRoomId).emit('landlord:call-turn', {
          currentCaller: result.nextCaller
        });
      }
    } else {
      socket.emit('landlord:error', { message: result.error });
    }
  });
  
  socket.on('landlord:play-cards', ({ cards }) => {
    const room = rooms.landlord.get(socket.gameRoomId);
    if (!room) return;
    
    const result = room.playCards(socket.id, cards);
    if (result.success) {
      io.to(socket.gameRoomId).emit('landlord:cards-played', {
        player: result.player,
        cards,
        cardType: result.cardType
      });
      
      if (room.winner) {
        io.to(socket.gameRoomId).emit('landlord:game-over', {
          winner: room.winner
        });
      } else {
        room.currentPlayer = (room.currentPlayer + 1) % 3;
        io.to(socket.gameRoomId).emit('landlord:play-turn', {
          currentPlayer: room.currentPlayer
        });
      }
    } else {
      socket.emit('landlord:error', { message: result.error });
    }
  });
  
  socket.on('landlord:pass', () => {
    const room = rooms.landlord.get(socket.gameRoomId);
    if (!room) return;
    
    const result = room.pass(socket.id);
    if (result.success) {
      io.to(socket.gameRoomId).emit('landlord:pass-made', {
        player: result.player
      });
      
      if (room.passCount >= 2) {
        room.lastPlayedCards = null;
        room.passCount = 0;
      }
      
      room.currentPlayer = (room.currentPlayer + 1) % 3;
      io.to(socket.gameRoomId).emit('landlord:play-turn', {
        currentPlayer: room.currentPlayer
      });
    }
  });
  
  socket.on('landlord:leave-room', () => {
    handleLeave('landlord', socket);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
    handleLeave(socket.gameType, socket);
  });
  
  function handleLeave(game, socket) {
    const room = rooms[game]?.get(socket.gameRoomId);
    if (!room) return;
    
    const result = room.removePlayer(socket.id);
    if (result.removed) {
      socket.to(socket.gameRoomId).emit(`${game}:player-left`, {
        position: result.position
      });
    }
    
    if (room.getPlayerCount() === 0) {
      rooms[game].delete(socket.gameRoomId);
    }
    
    socket.leave(socket.gameRoomId);
    socket.gameRoomId = null;
    socket.gameType = null;
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
