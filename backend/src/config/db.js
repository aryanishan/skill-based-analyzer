const mongoose = require('mongoose');

const getMongoUri = () => process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;

const getConnectionHint = (uri, error) => {
  const isSrvUri = typeof uri === 'string' && uri.startsWith('mongodb+srv://');
  const message = error?.message || '';

  if (isSrvUri && /querySrv/i.test(message)) {
    return [
      'Atlas SRV DNS lookup failed.',
      'Your network/DNS server could not resolve the cluster record.',
      'Fix DNS/internet access or provide a non-SRV Atlas string in MONGO_DIRECT_URI.'
    ].join(' ');
  }

  return '';
};

const connectDB = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    console.error('MongoDB connection skipped: set MONGO_URI or MONGO_DIRECT_URI.');
    return false;
  }

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    const hint = getConnectionHint(mongoUri, error);
    console.error(`MongoDB connection failed: ${error.message}${hint ? ` ${hint}` : ''}`);
    return false;
  }
};

module.exports = connectDB;
