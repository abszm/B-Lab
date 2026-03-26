const BOARD_SIZE = 15;

class GobangRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.status = 'waiting';
    this.players = [null, null];
    this.currentTurn = 0;
    this.board = this.createEmptyBoard();
    this.winner = null;
    this.moveCount = 0;
    this.lastMove = null;
  }
  
  createEmptyBoard() {
    return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
  }
  
  addPlayer(player) {
    const slot = this.players[0] === null ? 0 : 1;
    if (this.players[slot] !== null) {
      return false;
    }
    
    player.role = slot === 0 ? 'black' : 'white';
    this.players[slot] = player;
    
    if (this.players[0] && this.players[1]) {
      this.status = 'ready';
    }
    
    return true;
  }
  
  removePlayer(playerId) {
    for (let i = 0; i < this.players.length; i++) {
      if (this.players[i]?.id === playerId) {
        this.players[i] = null;
        return { removed: true, position: i };
      }
    }
    return { removed: false };
  }
  
  getPlayerCount() {
    return this.players.filter(p => p !== null).length;
  }
  
  getPlayerBySocket(socketId) {
    return this.players.findIndex(p => p?.socketId === socketId);
  }
  
  startGame() {
    if (this.players[0] && this.players[1]) {
      this.status = 'playing';
      this.currentTurn = 0;
    }
  }
  
  makeMove(socketId, x, y) {
    if (this.status !== 'playing') {
      return { success: false, error: 'Game is not in playing state' };
    }
    
    const playerIndex = this.getPlayerBySocket(socketId);
    if (playerIndex === -1) {
      return { success: false, error: 'Player not found' };
    }
    
    if (playerIndex !== this.currentTurn) {
      return { success: false, error: 'Not your turn' };
    }
    
    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
      return { success: false, error: 'Invalid position' };
    }
    
    if (this.board[y][x] !== 0) {
      return { success: false, error: 'Cell already occupied' };
    }
    
    const stone = playerIndex === 0 ? 1 : 2;
    this.board[y][x] = stone;
    this.moveCount++;
    this.lastMove = { x, y };
    
    if (this.checkWin(x, y, stone)) {
      this.winner = playerIndex;
      this.status = 'ended';
      return { success: true, player: playerIndex };
    }
    
    if (this.moveCount === BOARD_SIZE * BOARD_SIZE) {
      this.winner = -1;
      this.status = 'ended';
      return { success: true, player: playerIndex };
    }
    
    this.currentTurn = 1 - this.currentTurn;
    return { success: true, player: playerIndex };
  }
  
  checkWin(x, y, stone) {
    const directions = [
      [1, 0],
      [0, 1],
      [1, 1],
      [1, -1]
    ];
    
    for (const [dx, dy] of directions) {
      let count = 1;
      
      for (let i = 1; i < 5; i++) {
        const nx = x + dx * i;
        const ny = y + dy * i;
        if (ny >= 0 && ny < BOARD_SIZE && nx >= 0 && nx < BOARD_SIZE && this.board[ny][nx] === stone) {
          count++;
        } else {
          break;
        }
      }
      
      for (let i = 1; i < 5; i++) {
        const nx = x - dx * i;
        const ny = y - dy * i;
        if (ny >= 0 && ny < BOARD_SIZE && nx >= 0 && nx < BOARD_SIZE && this.board[ny][nx] === stone) {
          count++;
        } else {
          break;
        }
      }
      
      if (count >= 5) {
        return true;
      }
    }
    
    return false;
  }
  
  getState() {
    return {
      roomId: this.roomId,
      status: this.status,
      players: this.players,
      currentTurn: this.currentTurn,
      board: this.board,
      winner: this.winner,
      moveCount: this.moveCount,
      lastMove: this.lastMove
    };
  }
}

module.exports = GobangRoom;
