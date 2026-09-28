const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    text: { type: String, required: true, trim: true },
    status: { type: String, enum: ['sent', 'delivered', 'read'], default: 'sent' },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
