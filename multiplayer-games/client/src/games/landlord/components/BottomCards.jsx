import { Card } from './CardHand';
import './BottomCards.css';

function BottomCards({ cards }) {
  return (
    <div className="bottom-cards">
      <span className="label">底牌</span>
      <div className="cards">
        {cards.map((card, i) => (
          <Card key={card + i} card={card} small />
        ))}
      </div>
    </div>
  );
}

export default BottomCards;
