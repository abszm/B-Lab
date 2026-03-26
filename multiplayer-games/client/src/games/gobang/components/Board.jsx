import Cell from './Cell';

function Board({ board, onCellClick, lastMove }) {
  return (
    <div className="board-container">
      <div className="board">
        {board.map((row, y) => (
          <div key={y} className="board-row">
            {row.map((cell, x) => (
              <Cell
                key={`${x}-${y}`}
                x={x}
                y={y}
                value={cell}
                isLastMove={lastMove && lastMove.x === x && lastMove.y === y}
                onClick={() => onCellClick(x, y)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Board;
