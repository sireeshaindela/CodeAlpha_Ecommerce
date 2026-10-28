const net = require('net');
const mongoose = require('mongoose');

let mongodInstance = null;

/**
 * Fast network probe to check if a local port is actively accepting connections
 */
function isPortOpen(host, port, timeout = 600) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

/**
 * Connect to MongoDB:
 * 1. If remote URI (Atlas) or local port 27017 is running, connect directly.
 * 2. If local port 27017 is not running and in development/test, seamlessly start
 *    an embedded in-memory MongoDB server (mongodb-memory-server).
 */
async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shopeasy';
  const isLocalhost = uri.includes('127.0.0.1') || uri.includes('localhost');

  let shouldAttemptDirect = true;

  if (isLocalhost && process.env.NODE_ENV !== 'production') {
    const portMatch = uri.match(/:(\d+)/);
    const port = portMatch ? parseInt(portMatch[1], 10) : 27017;
    const host = uri.includes('localhost') ? 'localhost' : '127.0.0.1';

    const open = await isPortOpen(host, port);
    if (!open) {
      shouldAttemptDirect = false;
      console.log(`[Database] Local MongoDB not detected on port ${port}.`);
      console.log('[Database] Starting embedded in-memory MongoDB (mongodb-memory-server) for zero-config local run...');
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const fallbackUri = mongodInstance.getUri();
      
      await mongoose.connect(fallbackUri);
      console.log(`[Database] Successfully connected to embedded MongoDB: ${fallbackUri}`);
      return;
    }
  }

  if (shouldAttemptDirect) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[Database] Connected to MongoDB at: ${uri.replace(/:([^:@]{1,})@/, ':****@')}`);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[Database] Primary connection failed (${err.message}). Falling back to embedded MongoDB...`);
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const fallbackUri = mongodInstance.getUri();
        await mongoose.connect(fallbackUri);
        console.log(`[Database] Connected to embedded MongoDB: ${fallbackUri}`);
      } else {
        throw err;
      }
    }
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}

module.exports = {
  connectDB,
  disconnectDB
};
