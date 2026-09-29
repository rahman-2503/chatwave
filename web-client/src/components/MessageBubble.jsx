import { formatTime, initials, colorFor } from '../utils/format';

const TICK_LABEL = {
  sent: 'Sent',
  delivered: 'Delivered',
  read: 'Read',
};

function Ticks({ status }) {
  if (!status) return null;
  const label = TICK_LABEL[status] || 'Sent';
  return (
    <span
      className={`ticks ${status}`}
      title={label}
      aria-label={label}
      data-status={label}
    >
      {status === 'sent' ? '✓' : '✓✓'}
    </span>
  );
}

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
          <span className="meta">
            <span className="time">{formatTime(message.timestamp)}</span>
            {isOwn && <Ticks status={message.status} />}
          </span>
        </div>
      </div>
    </div>
  );
}
