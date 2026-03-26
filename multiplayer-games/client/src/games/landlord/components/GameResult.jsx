import './GameResult.css';

function GameResult({ winner, myPosition, landlordIndex, onPlayAgain, onLeave }) {
  const isLandlord = myPosition === landlordIndex;
  const isWinner = (winner === 'landlord' && isLandlord) || 
                   (winner === 'farmer' && !isLandlord);
  
  const getResultText = () => {
    if (winner === 'landlord') {
      return isLandlord ? '你赢了!' : '地主获胜';
    } else {
      return isLandlord ? '你输了!' : '你赢了!';
    }
  };

  return (
    <div className="result-overlay">
      <div className="result-content">
        <h2 className={isWinner ? 'win' : 'lose'}>{getResultText()}</h2>
        <p className="result-detail">
          {winner === 'landlord' ? '地主' : '农民'}获胜
        </p>
        <div className="result-actions">
          <button className="btn btn-primary" onClick={onPlayAgain}>
            再来一局
          </button>
          <button className="btn btn-secondary" onClick={onLeave}>
            返回大厅
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameResult;
