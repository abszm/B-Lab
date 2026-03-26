import './Cell.css';

function Cell({ x, y, value, isLastMove, onClick }) {
  return (
    <div 
      className={`cell ${isLastMove ? 'last-move' : ''}`}
      onClick={onClick}
    >
      <div className="cell-inner">
        {value === 1 && <div className="stone black" />}
        {value === 2 && <div className="stone white" />}
      </div>
    </div>
  );
}

export default Cell;
