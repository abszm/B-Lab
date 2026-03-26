import './Card.css';

function Card({ card, selected, onClick, index, small }) {
  const getCardInfo = (cardStr) => {
    const valueMap = {
      '3': { num: '3', color: 'red' },
      '4': { num: '4', color: 'red' },
      '5': { num: '5', color: 'red' },
      '6': { num: '6', color: 'red' },
      '7': { num: '7', color: 'red' },
      '8': { num: '8', color: 'red' },
      '9': { num: '9', color: 'red' },
      '10': { num: '10', color: 'red' },
      'J': { num: 'J', color: 'black' },
      'Q': { num: 'Q', color: 'black' },
      'K': { num: 'K', color: 'black' },
      'A': { num: 'A', color: 'red' },
      '2': { num: '2', color: 'red' },
      'small_joker': { num: 'joker', color: 'joker' },
      'big_joker': { num: 'JOKER', color: 'joker' }
    };
    
    const suitMap = {
      's': '♠',
      'h': '♥',
      'd': '♦',
      'c': '♣'
    };
    
    let value, suit;
    
    if (cardStr === 'small_joker' || cardStr === 'big_joker') {
      value = valueMap[cardStr];
      suit = '';
    } else {
      const lastChar = cardStr.slice(-1);
      const cardValue = cardStr.slice(0, -1);
      value = { ...valueMap[cardValue], suit: suitMap[lastChar] };
      suit = suitMap[lastChar];
    }
    
    return valueMap[cardStr] || { num: cardStr, color: 'black' };
  };

  const info = getCardInfo(card);
  const isJoker = card === 'small_joker' || card === 'big_joker';
  const isRed = info.color === 'red';

  return (
    <div 
      className={`landlord-card ${selected ? 'selected' : ''} ${small ? 'small' : ''} ${isJoker ? 'joker' : ''}`}
      onClick={onClick}
      style={{
        '--card-color': isRed ? '#e63946' : (isJoker ? '#9b59b6' : '#333')
      }}
    >
      <div className="card-inner">
        {isJoker ? (
          <div className="joker-content">
            <span className="joker-icon">
              {card === 'small_joker' ? '🃏' : '🃏'}
            </span>
            <span className="joker-label">
              {card === 'small_joker' ? '小王' : '大王'}
            </span>
          </div>
        ) : (
          <>
            <div className="card-value">
              <span className={isRed ? 'red' : ''}>{info.num}</span>
              <span className={`suit ${isRed ? 'red' : ''}`}>{info.suit}</span>
            </div>
            <div className={`card-suit-large ${isRed ? 'red' : ''}`}>
              {info.suit}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Card;
