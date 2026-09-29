const mongoose = require('mongoose');

const USE_MEMORY_STORE = () => {
  if (process.env.USE_MEMORY_STORE === 'true') return true;
  const uri = process.env.MONGODB_URI;
  if (!uri) return true;
  return uri.includes('localhost') || uri.includes('127.0.0.1');
};

const connectDB = async () => {
  if (USE_MEMORY_STORE()) {
    console.log('Storage: in-memory (data resets on restart)');
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`Storage: MongoDB (${conn.connection.host})`);
  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);
    console.error('Falling back to in-memory store. History will not persist.');
    process.env.USE_MEMORY_STORE = 'true';
  }
};

module.exports = connectDB;
