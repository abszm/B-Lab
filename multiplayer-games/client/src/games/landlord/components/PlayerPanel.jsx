import './PlayerPanel.css';

function PlayerPanel({ player, handCount, isLandlord, isCurrentPlayer, position }) {
  const positionLabels = ['左', '上', '右'];
  
  return (
    <div className={`player-panel ${isCurrentPlayer ? 'active' : ''}`}>
      <div className="player-info">
        <span className="position">{positionLabels[position]}</span>
        {isLandlord && <span className="landlord-badge">地主</span>}
      </div>
      <div className="hand-count">
        <span className="count">{handCount}</span>
        <span className="label">张</span>
      </div>
      {isCurrentPlayer && <span className="turn-indicator">出牌中</span>}
    </div>
  );
}

export default PlayerPanel;
