import './BidPanel.css';

function BidPanel({ currentBid, onBid }) {
  return (
    <div className="bid-panel">
      <div className="bid-info">
        <span className="label">叫地主</span>
        <span className="current-bid">当前最高: {currentBid > 0 ? currentBid + '分' : '无'}</span>
      </div>
      <div className="bid-buttons">
        <button className="bid-btn" onClick={() => onBid(1)}>1分</button>
        <button className="bid-btn" onClick={() => onBid(2)}>2分</button>
        <button className="bid-btn" onClick={() => onBid(3)}>3分</button>
        <button className="bid-btn pass" onClick={() => onBid(0)}>不叫</button>
      </div>
    </div>
  );
}

export default BidPanel;
