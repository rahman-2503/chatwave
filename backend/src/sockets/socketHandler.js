const memoryStore = require('../config/memoryStore');

const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('user_join', async (username) => {
      try {
        memoryStore.createOrUpdateUser(username, { isOnline: true, lastSeen: new Date() });
        onlineUsers.set(socket.id, username);
        socket.broadcast.emit('user_online', username);
        io.emit('online_users', memoryStore.getOnlineUsers());
      } catch (error) {
        socket.emit('error', { message: 'Failed to join' });
      }
    });

    socket.on('send_message', async (data) => {
      try {
        const { username, text } = data;
        if (!username || !text) {
          socket.emit('error', { message: 'Username and text are required' });
          return;
        }
        const message = memoryStore.createMessage({ username, text });
        io.emit('receive_message', message);

        const hasOtherClients = onlineUsers.size > 1;
        if (hasOtherClients) {
          memoryStore.updateMessageStatus(message._id, 'delivered');
          socket.emit('message_status_update', {
            messageId: message._id,
            status: 'delivered',
            username,
          });
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing', (username) => {
      socket.broadcast.emit('user_typing', username);
    });

    socket.on('stop_typing', (username) => {
      socket.broadcast.emit('user_stop_typing', username);
    });

    socket.on('message_read', async (data) => {
      try {
        const { messageId, reader } = data;
        if (!messageId || !reader) return;
        memoryStore.updateMessageStatus(messageId, 'read');
        io.emit('message_status_update', {
          messageId,
          status: 'read',
          reader,
        });
      } catch (error) {
        socket.emit('error', { message: 'Failed to update message status' });
      }
    });

    socket.on('disconnect', async () => {
      const username = onlineUsers.get(socket.id);
      if (username) {
        memoryStore.createOrUpdateUser(username, { isOnline: false, lastSeen: new Date() });
        onlineUsers.delete(socket.id);
        socket.broadcast.emit('user_offline', username);
        io.emit('online_users', memoryStore.getOnlineUsers());
      }
      console.log(`User disconnected: ${socket.id}`);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

module.exports = socketHandler;
