const dns = require('dns');
const mongoose = require('mongoose');

const getMongoUri = () => process.env.MONGO_DIRECT_URI || process.env.MONGO_URI;
const FALLBACK_DNS_SERVERS = ['8.8.8.8', '1.1.1.1'];

const isSrvUri = (uri) => typeof uri === 'string' && uri.startsWith('mongodb+srv://');
const isSrvLookupError = (error) => /querySrv/i.test(error?.message || '');

const enableFallbackDns = () => {
  const currentServers = dns.getServers();
  const alreadyUsingFallback = FALLBACK_DNS_SERVERS.every((server) => currentServers.includes(server));

  if (!alreadyUsingFallback) {
    dns.setServers(FALLBACK_DNS_SERVERS);
  }

  return dns.getServers();
};

const getConnectionHint = (uri, error) => {
  const message = error?.message || '';

  if (isSrvUri(uri) && /querySrv/i.test(message)) {
    return [
      'Atlas SRV DNS lookup failed.',
      'Your network/DNS server could not resolve the cluster record.',
      'The backend retried with public DNS servers.',
      'If it still fails, fix DNS/internet access or provide a non-SRV Atlas string in MONGO_DIRECT_URI.'
    ].join(' ');
  }

  return '';
};

const connectWithUri = async (mongoUri) =>
  mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 10000
  });

const connectDB = async () => {
  const mongoUri = getMongoUri();

  if (!mongoUri) {
    console.error('MongoDB connection skipped: set MONGO_URI or MONGO_DIRECT_URI.');
    return false;
  }

  try {
    const conn = await connectWithUri(mongoUri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    if (isSrvUri(mongoUri) && isSrvLookupError(error)) {
      try {
        const dnsServers = enableFallbackDns();
        console.warn(`MongoDB SRV lookup failed. Retrying with DNS servers: ${dnsServers.join(', ')}`);
        const conn = await connectWithUri(mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return true;
      } catch (retryError) {
        const hint = getConnectionHint(mongoUri, retryError);
        console.error(`MongoDB connection failed: ${retryError.message}${hint ? ` ${hint}` : ''}`);
        return false;
      }
    }

    const hint = getConnectionHint(mongoUri, error);
    console.error(`MongoDB connection failed: ${error.message}${hint ? ` ${hint}` : ''}`);
    return false;
  }
};

module.exports = connectDB;
