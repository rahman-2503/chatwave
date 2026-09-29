import { formatTime, initials, colorFor } from '../utils/format';

export default function MessageBubble({ message, isOwn }) {
  return (
    <div className={`row ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div
          className="avatar"
          style={{ background: colorFor(message.username) }}
          aria-hidden="true"
        >
          {initials(message.username)}
        </div>
      )}

      <div className="bubble-wrap">
        {!isOwn && <div className="author">{message.username}</div>}
        <div className={`bubble ${isOwn ? 'mine' : 'theirs'}`}>
          <span className="text">{message.text}</span>
          <span className="time">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    </div>
  );
}
