const messages = [];
const users = [];

const memoryStore = {
  createMessage: (data) => {
    const message = {
      _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      username: data.username,
      text: data.text,
      status: 'sent',
      timestamp: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    messages.push(message);
    return message;
  },

  getMessages: (limit = 50) => {
    return messages.slice(-limit);
  },

  updateMessageStatus: (messageId, status) => {
    const msg = messages.find((m) => m._id === messageId);
    if (msg) {
      msg.status = status;
    }
    return msg;
  },

  createOrUpdateUser: (username, updates) => {
    let user = users.find((u) => u.username === username);
    if (user) {
      Object.assign(user, updates, { updatedAt: new Date() });
    } else {
      user = {
        _id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        username,
        isOnline: false,
        lastSeen: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updates,
      };
      users.push(user);
    }
    return user;
  },

  getOnlineUsers: () => {
    return users.filter((u) => u.isOnline).map((u) => u.username);
  },
};

module.exports = memoryStore;
