const CARD_VALUES = {
  '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10,
  'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15, 'small_joker': 16, 'big_joker': 17
};

const SUIT_VALUES = { 's': 1, 'h': 2, 'd': 3, 'c': 4 };

function createDeck() {
  const deck = [];
  const values = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
  const suits = ['s', 'h', 'd', 'c'];
  
  for (const value of values) {
    for (const suit of suits) {
      deck.push(value + suit);
    }
  }
  deck.push('small_joker', 'big_joker');
  
  return deck;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getCardValue(card) {
  return CARD_VALUES[card.replace(/s|h|d|c/, '')] || CARD_VALUES[card];
}

function parseCardType(cards) {
  if (!cards || cards.length === 0) return null;
  
  if (cards.length === 1) {
    return { type: 'single', rank: getCardValue(cards[0]) };
  }
  
  const sorted = [...cards].sort((a, b) => getCardValue(b) - getCardValue(a));
  const valueGroups = {};
  
  sorted.forEach(card => {
    const value = getCardValue(card);
    if (!valueGroups[value]) valueGroups[value] = [];
    valueGroups[value].push(card);
  });
  
  const counts = Object.entries(valueGroups)
    .map(([value, group]) => ({ value: parseInt(value), count: group.length }))
    .sort((a, b) => b.count - a.count || b.value - a.value);
  
  const isJokerBomb = cards.length === 2 && 
    cards.includes('small_joker') && 
    cards.includes('big_joker');
  
  if (isJokerBomb) {
    return { type: 'joker-bomb', rank: 100 };
  }
  
  if (counts.length === 1 && counts[0].count === 4) {
    return { type: 'bomb', rank: 50 + counts[0].value };
  }
  
  if (counts.length === 1 && counts[0].count === 3) {
    return { type: 'triple', rank: counts[0].value };
  }
  
  if (counts.length === 1 && counts[0].count === 2) {
    return { type: 'pair', rank: counts[0].value };
  }
  
  if (counts.length === 2 && counts[0].count === 3 && counts[1].count === 1) {
    return { type: 'triple-single', rank: counts[0].value };
  }
  
  if (counts.length === 2 && counts[0].count === 3 && counts[1].count === 2) {
    return { type: 'triple-pair', rank: counts[0].value };
  }
  
  if (counts.length === 1 && counts[0].count === 4) {
    return { type: 'bomb', rank: 50 + counts[0].value };
  }
  
  return { type: 'unknown', rank: 0 };
}

function canBeat(playedCards, upperCards) {
  if (!upperCards) return true;
  if (upperCards.type === 'joker-bomb') return false;
  
  if (playedCards.type === 'joker-bomb') return true;
  
  if (playedCards.type === 'bomb' && upperCards.type !== 'bomb' && upperCards.type !== 'joker-bomb') {
    return true;
  }
  
  if (playedCards.type !== upperCards.type) return false;
  if (playedCards.cards.length !== upperCards.cards.length) return false;
  
  return playedCards.rank > upperCards.rank;
}

class LandlordRoom {
  constructor(roomId) {
    this.roomId = roomId;
    this.status = 'waiting';
    this.players = [null, null, null];
    this.landlordIndex = null;
    this.currentCaller = 0;
    this.currentPlayer = 0;
    this.highestBid = 0;
    this.highestBidder = null;
    this.hands = [[], [], []];
    this.bottomCards = [];
    this.lastPlayedCards = null;
    this.passCount = 0;
    this.winner = null;
  }
  
  addPlayer(player) {
    for (let i = 0; i < 3; i++) {
      if (this.players[i] === null) {
        player.position = i;
        this.players[i] = player;
        return i;
      }
    }
    return -1;
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
  
  getPlayerPosition(socketId) {
    return this.players.findIndex(p => p?.id === socketId);
  }
  
  getPlayerBySocket(socketId) {
    return this.players.find(p => p?.id === socketId);
  }
  
  startGame() {
    const deck = shuffle(createDeck());
    
    for (let i = 0; i < 3; i++) {
      this.hands[i] = deck.slice(i * 17, (i + 1) * 17).sort((a, b) => getCardValue(b) - getCardValue(a));
    }
    
    this.bottomCards = deck.slice(51);
    this.status = 'calling';
    this.currentCaller = Math.floor(Math.random() * 3);
  }
  
  callBid(socketId, bid) {
    if (this.status !== 'calling') {
      return { success: false, error: 'Not in calling phase' };
    }
    
    const playerIndex = this.getPlayerPosition(socketId);
    if (playerIndex !== this.currentCaller) {
      return { success: false, error: 'Not your turn to call' };
    }
    
    if (bid <= this.highestBid && bid !== 3) {
      return { success: false, error: 'Bid must be higher than current highest' };
    }
    
    if (bid !== 0 && bid !== 1 && bid !== 2 && bid !== 3) {
      return { success: false, error: 'Invalid bid value' };
    }
    
    this.highestBid = bid;
    this.highestBidder = playerIndex;
    
    if (bid === 3) {
      this.landlordIndex = playerIndex;
      this.hands[playerIndex].push(...this.bottomCards);
      this.hands[playerIndex].sort((a, b) => getCardValue(b) - getCardValue(a));
      this.status = 'playing';
      this.currentPlayer = playerIndex;
      return { success: true, player: playerIndex, landlordSelected: true };
    }
    
    let nextCaller = (this.currentCaller + 1) % 3;
    let allCalled = true;
    for (let i = 0; i < 3; i++) {
      if (i !== this.highestBidder && this.highestBid === 0) {
        allCalled = false;
        break;
      }
    }
    
    if (this.highestBid > 0) {
      let higherCalls = 0;
      for (let i = 0; i < 3; i++) {
        if (i !== this.highestBidder) {
          higherCalls++;
        }
      }
      if (higherCalls === 0) {
        this.landlordIndex = this.highestBidder;
        this.hands[this.landlordIndex].push(...this.bottomCards);
        this.hands[this.landlordIndex].sort((a, b) => getCardValue(b) - getCardValue(a));
        this.status = 'playing';
        this.currentPlayer = this.landlordIndex;
        return { success: true, player: playerIndex, landlordSelected: true };
      }
    }
    
    while (nextCaller === this.highestBidder && this.highestBid > 0) {
      nextCaller = (nextCaller + 1) % 3;
    }
    
    this.currentCaller = nextCaller;
    return { success: true, player: playerIndex, nextCaller };
  }
  
  startPlaying() {
    this.status = 'playing';
    this.currentPlayer = this.landlordIndex;
  }
  
  playCards(socketId, cards) {
    if (this.status !== 'playing') {
      return { success: false, error: 'Not in playing phase' };
    }
    
    const playerIndex = this.getPlayerPosition(socketId);
    if (playerIndex !== this.currentPlayer) {
      return { success: false, error: 'Not your turn' };
    }
    
    const hand = this.hands[playerIndex];
    const cardSet = new Set(hand);
    for (const card of cards) {
      if (!cardSet.has(card)) {
        return { success: false, error: 'You don\'t have these cards' };
      }
    }
    
    const cardType = parseCardType(cards);
    if (cardType.type === 'unknown') {
      return { success: false, error: 'Invalid card type' };
    }
    
    if (this.lastPlayedCards && !canBeat(cardType, this.lastPlayedCards)) {
      return { success: false, error: 'Cards cannot beat the previous play' };
    }
    
    for (const card of cards) {
      const idx = this.hands[playerIndex].indexOf(card);
      if (idx > -1) {
        this.hands[playerIndex].splice(idx, 1);
      }
    }
    
    this.lastPlayedCards = { player: playerIndex, cards, ...cardType };
    this.passCount = 0;
    
    if (this.hands[playerIndex].length === 0) {
      if (playerIndex === this.landlordIndex) {
        this.winner = 'landlord';
      } else {
        this.winner = 'farmer';
      }
      this.status = 'ended';
    }
    
    return { success: true, player: playerIndex, cardType };
  }
  
  pass(socketId) {
    if (this.status !== 'playing') {
      return { success: false, error: 'Not in playing phase' };
    }
    
    const playerIndex = this.getPlayerPosition(socketId);
    if (playerIndex !== this.currentPlayer) {
      return { success: false, error: 'Not your turn' };
    }
    
    this.passCount++;
    
    return { success: true, player: playerIndex };
  }
  
  getState() {
    return {
      roomId: this.roomId,
      status: this.status,
      players: this.players,
      landlordIndex: this.landlordIndex,
      currentPlayer: this.currentPlayer,
      hands: this.hands,
      bottomCards: this.bottomCards,
      winner: this.winner
    };
  }
}

module.exports = LandlordRoom;
