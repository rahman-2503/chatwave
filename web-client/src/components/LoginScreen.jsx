import { useState } from 'react';

export default function LoginScreen({ onJoin }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const submit = (e) => {
    e.preventDefault();
    const name = value.trim();
    if (!name) {
      setError('Please enter a username');
      return;
    }
    if (name.length > 24) {
      setError('Username must be 24 characters or fewer');
      return;
    }
    onJoin(name);
  };

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="logo">CW</div>
        <h1>ChatWave</h1>
        <p className="tagline">Real-time chat with Socket.io</p>

        <label htmlFor="username">Your username</label>
        <input
          id="username"
          type="text"
          placeholder="e.g. rahman"
          value={value}
          autoComplete="off"
          autoFocus
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError('');
          }}
        />
        {error && <p className="error">{error}</p>}

        <button type="submit">Join Chat</button>
        <p className="hint">No password needed. Pick any name to continue.</p>
      </form>
    </div>
  );
}
