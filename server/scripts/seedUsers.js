/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User');

// Configuration
const NUM_ADMINS = 3;
const NUM_MANAGERS = 5;
const NUM_CUSTOMERS = 10;
const DEFAULT_PASSWORD = '123456';

async function run() {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    console.error('Missing MONGO_URI');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI, {
    dbName: process.env.MONGO_DB || 'katostore',
  });
  console.log('MongoDB connected');

  // Delete existing users
  const { deletedCount } = await User.deleteMany({});
  console.log(`Cleared ${deletedCount} existing users`);

  const passwordHash = await User.hashPassword(DEFAULT_PASSWORD);

  const users = [];

  // Create admin users
  for (let i = 1; i <= NUM_ADMINS; i++) {
    users.push({
      name: `Admin ${i}`,
      email: `admin${i}@gmail.com`,
      role: 'admin',
      passwordHash,
    });
  }

  // Create manager users
  for (let i = 1; i <= NUM_MANAGERS; i++) {
    users.push({
      name: `Manager ${i}`,
      email: `manager${i}@gmail.com`,
      role: 'manager',
      passwordHash,
    });
  }

  // Create customer users
  for (let i = 1; i <= NUM_CUSTOMERS; i++) {
    users.push({
      name: `Customer ${i}`,
      email: `customer${i}@gmail.com`,
      role: 'customer',
      passwordHash,
    });
  }

  // Insert all users
  const result = await User.insertMany(users);
  console.log(`Seeded ${result.length} users`);

  await mongoose.disconnect();
  console.log('Done');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
