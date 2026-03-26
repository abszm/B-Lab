import { useState } from 'react';
import { Card } from './CardHand';
import './PlayArea.css';

function PlayArea({ lastPlayedCards, isMyTurn, onPlayCards, onPass }) {
  const [selectedCards, setSelectedCards] = useState([]);

  const handleCardClick = (card) => {
    if (!isMyTurn) return;
    
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const handlePlay = () => {
    if (selectedCards.length > 0) {
      onPlayCards(selectedCards);
      setSelectedCards([]);
    }
  };

  const handlePass = () => {
    onPass();
    setSelectedCards([]);
  };

  return (
    <div className="play-area">
      {lastPlayedCards && (
        <div className="last-played">
          <span className="label">上家出牌:</span>
          <div className="cards">
            {lastPlayedCards.cards.map((card, i) => (
              <Card key={`${card}-${i}`} card={card} small />
            ))}
          </div>
        </div>
      )}

      {isMyTurn && (
        <div className="play-actions">
          <button 
            className="btn btn-play" 
            onClick={handlePlay}
            disabled={selectedCards.length === 0}
          >
            出牌
          </button>
          <button 
            className="btn btn-pass" 
            onClick={handlePass}
          >
            不出
          </button>
        </div>
      )}

      {!isMyTurn && (
        <div className="waiting-play">
          <span>等待玩家出牌...</span>
        </div>
      )}
    </div>
  );
}

export default PlayArea;
