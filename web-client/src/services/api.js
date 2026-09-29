const DEV_URL = 'http://localhost:5000';
const PROD_URL = 'https://chatwave-backend-dtwb.onrender.com';

const isLocalPreview =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1';

export const API_URL = import.meta.env.VITE_API_URL ||
  (isLocalPreview ? DEV_URL : PROD_URL);

export const getHealth = async () => {
  const res = await fetch(`${API_URL}/health`);
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
};

export const fetchHistory = async (limit = 50) => {
  const res = await fetch(`${API_URL}/api/messages/history?limit=${limit}`);
  if (!res.ok) throw new Error('Failed to load history');
  return res.json();
};

export const postMessage = async (username, text) => {
  const res = await fetch(`${API_URL}/api/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, text }),
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};
