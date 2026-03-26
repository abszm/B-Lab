import { useState } from 'react';
import Card from './Card';
import './CardHand.css';

function CardHand({ cards, isMyHand }) {
  const [selectedCards, setSelectedCards] = useState([]);

  const toggleCard = (card) => {
    if (selectedCards.includes(card)) {
      setSelectedCards(selectedCards.filter(c => c !== card));
    } else {
      setSelectedCards([...selectedCards, card]);
    }
  };

  const clearSelection = () => {
    setSelectedCards([]);
  };

  return (
    <div className={`card-hand ${isMyHand ? 'my-hand' : ''}`}>
      <div className="cards-container">
        {cards.map((card, index) => (
          <Card
            key={card}
            card={card}
            selected={selectedCards.includes(card)}
            onClick={() => isMyHand && toggleCard(card)}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}

export { CardHand, Card };
