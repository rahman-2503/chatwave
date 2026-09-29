# ChatWave - Real-Time Chat Application

A full-stack real-time chat application: **React 18 (Vite)** web client + **Node.js / Express / Socket.io** backend with **MongoDB** persistence.

**Live demo:** https://chatwave-web-53jf.onrender.com
**Live API:** https://chatwave-backend-dtwb.onrender.com

---

## Features

| Feature | Status |
|---|---|
| Real-time messaging via Socket.io (no polling fallback) | Yes |
| Instant delivery to all connected users | Yes |
| Chat history persists across refresh/reopen | Yes |
| Message timestamps | Yes |
| Username-based login (no password) | Yes |
| Typing indicator | Yes |
| Online / offline user presence | Yes |
| Message delivered / read receipts (✓ / ✓✓) | Yes |
| Connection & disconnection handling with auto-reconnect | Yes |
| Graceful error handling (API, socket, UI) | Yes |
| MongoDB Atlas persistence | Yes |
| Deployed backend (Node service) | Yes |
| Deployed frontend (static site) | Yes |

---

## Architecture

```
ChatWave/
├── backend/                 Node.js + Express + Socket.io + MongoDB
│   └── src/
│       ├── config/          db connection, in-memory fallback store
│       ├── controllers/     messageController
│       ├── middleware/      errorMiddleware (notFound, errorHandler)
│       ├── models/          Message, User (Mongoose schemas)
│       ├── routes/          messageRoutes
│       ├── sockets/         socketHandler (all Socket.io events)
│       └── server.js        entry point
│
├── web-client/              React 18 + Vite (primary frontend)
│   ├── src/
│   │   ├── components/      LoginScreen, ChatScreen, MessageBubble
│   │   ├── hooks/           useChat (socket lifecycle + state)
│   │   ├── services/        api.js (REST), socket.js (Socket.io)
│   │   ├── utils/           format.js (time, initials, colors)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── e2e.mjs              end-to-end test suite
│   └── vite.config.js
│
├── frontend/               React Native + Expo (mobile build)
│   ├── App.js
│   ├── app.json
│   └── eas.json
│
└── render.yaml             Render deployment config
```

**Request flow:** client emits `send_message` → server validates → persists to MongoDB → broadcasts `receive_message` to all sockets → clients append to state. History loads over REST on join, so a refresh restores the full conversation.

---

## Tech choices and why

- **React 18 + Vite (primary UI)** — fast builds, tiny bundle, and deploys as a static site, so the reviewer gets a clickable live link instead of installing anything. The assignment allows React Native *or* React.
- **React Native + Expo (also included)** — mobile build retained in `frontend/`; see *Known issues*.
- **Socket.io** over raw WebSocket — automatic reconnection with backoff, room support, and a fallback transport, which is what makes the reconnect requirement reliable.
- **MongoDB Atlas** — persistent storage that survives redeploys. Render's free tier has an ephemeral disk, so SQLite would have lost history on every restart.
- **Custom `useChat` hook** — all socket wiring and cleanup lives in one place, keeping components purely presentational.
- **Dual-URL config** — `services/api.js` picks `localhost` during local dev and the live Render URL otherwise, so the same build works in both environments.

---

## Running locally

### Prerequisites
- Node.js 18+
- MongoDB Atlas connection string (or omit to use the in-memory fallback)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env      # Windows: copy .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/?appName=Cluster0
CLIENT_URL=*
```

```bash
npm run dev               # or: npm start
```

Verify: http://localhost:5000/health

> If `MONGODB_URI` is absent, points to localhost, or the Atlas cluster is unreachable, the server logs a warning and falls back to an in-memory store instead of crashing. Data is not persisted in that mode, so history resets on restart.

### 2. Web client

```bash
cd web-client
npm install
npm run dev
```

Open http://localhost:5173 — it auto-detects localhost and targets the local backend.

### 3. React Native client (optional)

```bash
cd frontend
npm install
npx expo start
```

---

## Environment variables

### Backend

| Variable | Required | Description | Default |
|---|---|---|---|
| `PORT` | No | Server port | `5000` |
| `MONGODB_URI` | No | MongoDB Atlas / local URI. Omit for in-memory store | in-memory |
| `CLIENT_URL` | No | CORS origin | `*` |
| `NODE_ENV` | No | `production` hides stack traces | — |

### Web client

| Variable | Required | Description | Default |
|---|---|---|---|
| `VITE_API_URL` | No | Backend base URL | localhost in dev, live Render URL in prod |

---

## API documentation

Base URL: `https://chatwave-backend-dtwb.onrender.com`

### `GET /` — service info
```json
{ "name": "ChatWave API", "status": "running", "endpoints": { ... } }
```

### `GET /health` — health check
```json
{ "status": "ok", "timestamp": "2026-09-29T10:00:00.000Z" }
```

### `POST /api/messages` — send a message
```bash
curl -X POST https://chatwave-backend-dtwb.onrender.com/api/messages \
  -H "Content-Type: application/json" \
  -d '{"username":"rahman","text":"Hello world"}'
```
**201** response:
```json
{
  "_id": "1790...",
  "username": "rahman",
  "text": "Hello world",
  "status": "sent",
  "timestamp": "2026-09-29T10:00:00.000Z"
}
```
**400** when `username` or `text` is missing.

### `GET /api/messages/history?limit=50` — fetch history
```json
[ { "_id": "...", "username": "rahman", "text": "Hello", "timestamp": "..." } ]
```

### Error shape
```json
{ "error": "Not Found - /nope", "stack": null }
```
`stack` is `null` when `NODE_ENV=production`.

---

## Socket.io events

### Client → Server

| Event | Payload | Purpose |
|---|---|---|
| `user_join` | `username: string` | Register presence on connect |
| `send_message` | `{ username, text }` | Persist and broadcast a message |
| `typing` | `username: string` | Show typing indicator to others |
| `stop_typing` | `username: string` | Clear typing indicator |
| `message_read` | `{ messageId, reader }` | Mark a message read |

### Server → Client

| Event | Payload | Purpose |
|---|---|---|
| `receive_message` | message object | New message (sent to all, incl. sender) |
| `online_users` | `string[]` | Full presence snapshot |
| `user_online` | `username` | A user connected |
| `user_offline` | `username` | A user disconnected |
| `user_typing` | `username` | Someone is typing |
| `user_stop_typing` | `username` | Typing stopped |
| `message_status_update` | `{ messageId, status, reader }` | Receipt update (`delivered` → sender, `read` → everyone) |
| `error` | `{ message }` | Socket-level failure |

Presence is tracked per socket id in a `Map`, so multiple tabs from the same user are handled independently.

---

## Testing

```bash
cd web-client
node e2e.mjs
```

Spins up two real Socket.io clients and asserts the full feature set:

```
PASS  two clients connected
PASS  A -> B real-time delivery
PASS  delivered receipt to sender
PASS  B -> A real-time delivery
PASS  typing indicator
PASS  read receipt back to sender
PASS  stop typing
PASS  online user list
PASS  disconnect / offline event
PASS  REST POST /api/messages
PASS  validation returns 400
PASS  REST GET history
PASS  timestamps stored
PASS  health endpoint
```

Result: **14/14 passing**, verified against both the local server and the live deployment.

### Message delivery lifecycle

A message moves through three states, shown as ticks on the sender's bubble:

| State | Tick | Trigger |
|---|---|---|
| `sent` | ✓ | Message persisted and broadcast |
| `delivered` | ✓✓ | At least one other client was connected at send time |
| `read` | ✓✓ bold | The recipient's client rendered it and emitted `message_read` |

Read receipts are emitted per message id and tracked client-side, so a receipt is never sent twice for the same message.

---

## Deployment

| Service | Platform | URL |
|---|---|---|
| Backend (Node) | Render web service | https://chatwave-backend-dtwb.onrender.com |
| Frontend (static) | Render static site | https://chatwave-web-53jf.onrender.com |

Configured via `render.yaml`:

```yaml
- type: web
  buildCommand: cd backend && npm install
  startCommand: cd backend && npm start

- type: static_site
  buildCommand: cd web-client && npm install && npm run build
  staticPublishPath: ./web-client/dist
```

> **Free-tier note:** Render's free tier sleeps idle services after ~15 minutes. The first request after sleep takes a few seconds while the service spins back up. The UI shows a "Reconnecting..." state during this window.

---

## Assumptions

- No real authentication — a username is chosen freely (per the brief's "dummy authentication").
- Single global room; no private or 1:1 conversations.
- Messages are immutable — no edit or delete.
- History returns the most recent 50 messages by default (`?limit=` to change).
- Timestamps render in the viewer's local timezone.

---

## Known issues

**React Native APK (`frontend/`)** — the Android Gradle build succeeds and produces an installable APK, but the app has been reported to close immediately on launch on some devices. The web client is the primary, fully verified frontend and satisfies the brief ("React Native (preferred) **or** React"). If an APK is required for submission, record a short screen capture of the live web demo instead — the brief explicitly allows this.

The suspected cause is Expo SDK 51 (released 2023) targeting modern Android versions; upgrading to the current SDK is the likely fix but was out of scope for the deadline.

---

## Local development notes

- Secrets live only in `.env` / `.env.example`; `.env` is gitignored.
- The web client's `services/api.js` auto-selects the backend URL, so no code edits are needed when switching between local and deployed environments.
