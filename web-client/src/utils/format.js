export const formatTime = (value) => {
  const d = new Date(value);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDay = (value) => {
  const d = new Date(value);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  if (isToday) return 'Today';
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

export const initials = (name = '') =>
  name.trim().charAt(0).toUpperCase() || '?';

const COLORS = [
  '#667eea',
  '#f093fb',
  '#4facfe',
  '#43e97b',
  '#fa709a',
  '#fccb90',
  '#a18cd1',
  '#fdcbf1',
];

export const colorFor = (name = '') => {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
};
