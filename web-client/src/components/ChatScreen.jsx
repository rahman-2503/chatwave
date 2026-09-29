import { useEffect, useRef, useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageBubble from './MessageBubble';
import { formatDay, initials, colorFor } from '../utils/format';

export default function ChatScreen({ username, onLeave }) {
  const {
    messages,
    onlineUsers,
    typingUsers,
    status,
    loadingHistory,
    sendMessage,
    notifyTyping,
  } = useChat(username);

  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, typingUsers]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (sendMessage(draft)) setDraft('');
  };

  const statusLabel =
    status === 'online'
      ? 'Connected'
      : status === 'connecting'
        ? 'Connecting...'
        : 'Reconnecting...';

  return (
    <div className="chat">
      <header className="topbar">
        <div className="brand">
          <span className="logo small">CW</span>
          <div>
            <h2>ChatWave</h2>
            <span className={`status ${status}`}>
              <i className="dot" />
              {statusLabel}
            </span>
          </div>
        </div>

        <div className="topbar-right">
          <div className="avatars">
            {onlineUsers.slice(0, 5).map((u) => (
              <span
                key={u}
                className="avatar tiny"
                style={{ background: colorFor(u) }}
                title={u}
              >
                {initials(u)}
              </span>
            ))}
            <span className="count">{onlineUsers.length} online</span>
          </div>
          <button className="ghost" type="button" onClick={onLeave}>
            Leave
          </button>
        </div>
      </header>

      <main className="messages" ref={listRef}>
        {loadingHistory && <p className="muted center">Loading history...</p>}

        {!loadingHistory && messages.length === 0 && (
          <div className="empty">
            <div className="empty-emoji">👋</div>
            <p>No messages yet. Say hello to everyone.</p>
          </div>
        )}

        {messages.map((m, i) => {
          const prev = messages[i - 1];
          const newDay =
            !prev || formatDay(prev.timestamp) !== formatDay(m.timestamp);
          return (
            <div key={m._id}>
              {newDay && <div className="day">{formatDay(m.timestamp)}</div>}
              <MessageBubble message={m} isOwn={m.username === username} />
            </div>
          );
        })}

        {typingUsers.length > 0 && (
          <div className="typing">
            <span className="dots">
              <i />
              <i />
              <i />
            </span>
            {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'}{' '}
            typing...
          </div>
        )}
      </main>

      <form className="composer" onSubmit={handleSubmit}>
        <input
          value={draft}
          placeholder="Type a message..."
          onChange={(e) => {
            setDraft(e.target.value);
            notifyTyping();
          }}
        />
        <button type="submit" disabled={!draft.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}
