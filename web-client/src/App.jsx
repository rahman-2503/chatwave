import { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ChatScreen from './components/ChatScreen';

const STORAGE_KEY = 'chatwave_username';

export default function App() {
  const [username, setUsername] = useState(
    () => localStorage.getItem(STORAGE_KEY) || '',
  );

  const join = (name) => {
    localStorage.setItem(STORAGE_KEY, name);
    setUsername(name);
  };

  const leave = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsername('');
  };

  return username ? (
    <ChatScreen username={username} onLeave={leave} />
  ) : (
    <LoginScreen onJoin={join} />
  );
}
