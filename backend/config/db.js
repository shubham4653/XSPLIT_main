const mongoose = require('mongoose');

// Disable command buffering to fail fast on connection issues
mongoose.set('bufferCommands', false);

const connectDB = async () => {
  try {
    // First attempt to connect using MONGO_URI (if provided)
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        // Disable buffering of commands until connection is established
        bufferCommands: false
      });
      console.log('MongoDB Connected (Atlas)');
    } else {
      throw new Error('MONGO_URI not set');
    }
  } catch (atlasError) {
    console.warn('Atlas connection failed, falling back to local MongoDB:', atlasError.message);
    try {
      const conn = await mongoose.connect('mongodb://127.0.0.1:27017/xpense', {
        serverSelectionTimeoutMS: 10000,
        bufferCommands: false
      });
      console.log(`MongoDB Connected (Local): ${conn.connection.host}`);
    } catch (localError) {
      console.error('Local MongoDB connection failed:', localError.message);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
