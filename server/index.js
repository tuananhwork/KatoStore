require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const createApp = require('./src/app');

const PORT = process.env.PORT || 8000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      dbName: process.env.MONGO_DB || 'katostore',
    });
    // eslint-disable-next-line no-console
    console.log('MongoDB connected');

    const app = createApp();
    const server = http.createServer(app);

    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
