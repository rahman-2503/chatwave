# ChatWave - Real-Time Chat Application

A full-stack real-time chat application built with React Native (Expo), Node.js, Express, Socket.io, and MongoDB.

## Features

- Real-time messaging with Socket.io
- Chat history persistence with MongoDB
- Username-based login (no password required)
- Typing indicators
- Online/offline user status
- Message timestamps
- Automatic reconnection handling
- Clean, modern UI

## Project Structure

```
ChatWave/
├── backend/          # Node.js + Express + Socket.io
│   ├── src/
│   │   ├── config/      # Database configuration
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Error handling middleware
│   │   ├── models/      # Mongoose models
│   │   ├── routes/      # Express routes
│   │   ├── sockets/     # Socket.io handlers
│   │   └── server.js    # Entry point
│   ├── .env.example
│   └── package.json
├── frontend/         # React Native + Expo
│   ├── App.js
│   ├── app.json
│   └── package.json
└── README.md
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   copy .env.example .env
   ```

4. Update `.env` with your MongoDB URI:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/chatwave
   CLIENT_URL=http://localhost:3000
   ```

5. Start the server:
   ```bash
   npm run dev
   ```

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Update `API_URL` in `App.js` to match your backend URL.

4. Start the Expo development server:
   ```bash
   npm start
   ```

5. Scan the QR code with Expo Go app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| POST | `/api/messages` | Send a message |
| GET | `/api/messages/history` | Get chat history |

## Socket.io Events

### Client to Server
- `user_join` - User joins the chat
- `send_message` - Send a message
- `typing` - User is typing
- `stop_typing` - User stopped typing
- `message_read` - Message was read

### Server to Client
- `receive_message` - New message received
- `user_online` - User came online
- `user_offline` - User went offline
- `online_users` - List of online users
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `message_status_update` - Message status changed
- `error` - Error occurred

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/chatwave |
| `CLIENT_URL` | Allowed CORS origin | http://localhost:3000 |

## Deployment

### Backend (Render)

1. Push code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install`
5. Set start command: `cd backend && npm start`
6. Add environment variables in Render dashboard:
   - `PORT=5000`
   - `MONGODB_URI=<your-mongodb-atlas-uri>`
   - `CLIENT_URL=<your-frontend-url>`
7. Deploy

### MongoDB Atlas

1. Create a cluster at https://cloud.mongodb.com
2. Create a database user
3. Whitelist IP addresses (or allow all for development)
4. Get connection string and add to `.env`

### Local Development

The backend uses an in-memory data store when no cloud MongoDB URI is configured, so it works out of the box without any database setup.

## Design Decisions

- **Global chat room**: Simpler implementation, meets all requirements
- **MongoDB**: Persistent storage, easy to scale with Atlas
- **Socket.io**: Reliable real-time communication with automatic fallback
- **Expo**: Cross-platform mobile development with minimal setup
- **AsyncStorage**: Simple local persistence for username

## Assumptions

- No authentication required (username only)
- Single global chat room
- Messages stored indefinitely
- No message editing or deletion
