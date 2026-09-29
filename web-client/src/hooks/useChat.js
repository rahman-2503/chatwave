import { useCallback, useEffect, useRef, useState } from 'react';
import { createSocket } from '../services/socket';
import { fetchHistory } from '../services/api';

export function useChat(username) {
  const socketRef = useRef(null);
  const typingTimer = useRef(null);

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [status, setStatus] = useState('connecting');
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!username) return undefined;

    let cancelled = false;
    const socket = createSocket();
    socketRef.current = socket;

    const loadHistory = async () => {
      try {
        const history = await fetchHistory();
        if (!cancelled) setMessages(history);
      } catch {
        if (!cancelled) setMessages([]);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    };

    socket.on('connect', () => {
      setStatus('online');
      socket.emit('user_join', username);
    });

    socket.on('disconnect', () => setStatus('offline'));
    socket.io.on('reconnect_attempt', () => setStatus('connecting'));
    socket.io.on('reconnect', () => setStatus('online'));

    socket.on('connect_error', () => setStatus('offline'));

    socket.on('receive_message', (message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socket.on('message_status_update', ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, status } : m)),
      );
    });

    socket.on('online_users', (users) => setOnlineUsers(users));

    socket.on('user_online', (user) => {
      setOnlineUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
    });

    socket.on('user_offline', (user) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== user));
    });

    socket.on('user_typing', (user) => {
      setTypingUsers((prev) => (prev.includes(user) ? prev : [...prev, user]));
    });

    socket.on('user_stop_typing', (user) => {
      setTypingUsers((prev) => prev.filter((u) => u !== user));
    });

    socket.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.error('Socket error:', err?.message);
    });

    loadHistory();

    return () => {
      cancelled = true;
      if (typingTimer.current) clearTimeout(typingTimer.current);
      socket.removeAllListeners();
      socket.disconnect();
      socketRef.current = null;
    };
  }, [username]);

  const sendMessage = useCallback(
    (text) => {
      const clean = text.trim();
      if (!clean || !socketRef.current) return false;
      socketRef.current.emit('send_message', { username, text: clean });
      socketRef.current.emit('stop_typing', username);
      return true;
    },
    [username],
  );

  const notifyTyping = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit('typing', username);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', username);
    }, 1500);
  }, [username]);

  const markRead = useCallback(
    (messageId) => {
      if (!socketRef.current) return;
      socketRef.current.emit('message_read', { messageId, reader: username });
    },
    [username],
  );

  return {
    messages,
    onlineUsers,
    typingUsers,
    status,
    loadingHistory,
    sendMessage,
    notifyTyping,
    markRead,
  };
}
