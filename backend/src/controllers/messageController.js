const memoryStore = require('../config/memoryStore');

const sendMessage = async (req, res, next) => {
  try {
    const { username, text } = req.body;

    if (!username || !text) {
      return res.status(400).json({ error: 'Username and text are required' });
    }

    const message = memoryStore.createMessage({ username, text });
    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = memoryStore.getMessages(limit);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

module.exports = { sendMessage, getHistory };
