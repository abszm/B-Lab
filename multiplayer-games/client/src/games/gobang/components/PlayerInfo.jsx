import './PlayerInfo.css';

function PlayerInfo({ player, label, isCurrentTurn, isMe }) {
  return (
    <div className={`player-info ${isCurrentTurn ? 'active' : ''}`}>
      <div className="player-avatar">
        {label === '黑棋' ? (
          <div className="avatar black" />
        ) : (
          <div className="avatar white" />
        )}
      </div>
      <div className="player-details">
        <span className="player-label">{label}</span>
        {isMe && <span className="me-badge">我</span>}
      </div>
      {isCurrentTurn && <span className="turn-badge">回合中</span>}
    </div>
  );
}

export default PlayerInfo;
