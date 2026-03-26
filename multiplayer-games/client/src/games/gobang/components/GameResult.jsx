import './GameResult.css';

function GameResult({ winner, myRole, onPlayAgain, onLeave }) {
  const getResultText = () => {
    if (winner === 'black') {
      return myRole === 'black' ? '你赢了!' : '黑棋获胜';
    } else if (winner === 'white') {
      return myRole === 'white' ? '你赢了!' : '白棋获胜';
    } else {
      return '平局';
    }
  };

  const isWinner = (winner === 'black' && myRole === 'black') ||
                   (winner === 'white' && myRole === 'white');

  return (
    <div className="result-overlay">
      <div className="result-content">
        <h2 className={isWinner ? 'win' : ''}>{getResultText()}</h2>
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
