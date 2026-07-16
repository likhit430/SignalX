const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

// Load environment variables from the server directory .env file
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDemoUsers = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/signalx';
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding.');

    const demoUsers = [
      {
        name: 'Admin User',
        email: 'admin@email.com',
        password: 'Demo123',
        role: 'Admin'
      },
      {
        name: 'AI Operator',
        email: 'operator@email.com',
        password: 'Demo123',
        role: 'AI Operator'
      },
      {
        name: 'Volunteer User',
        email: 'volunteer@email.com',
        password: 'Demo123',
        role: 'Volunteer'
      }
    ];

    for (const u of demoUsers) {
      let user = await User.findOne({ email: u.email });
      if (user) {
        // Reset password, name, and role
        user.name = u.name;
        user.role = u.role;
        user.password = u.password; // Triggers the model pre-save hook to encrypt password
        await user.save();
        console.log(`Successfully updated demo user: ${u.email} (${u.role})`);
      } else {
        // Create new user
        user = await User.create(u);
        console.log(`Successfully created demo user: ${u.email} (${u.role})`);
      }
    }

    console.log('All demo users successfully seeded.');
  } catch (error) {
    console.error('Seeding Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB Connection closed.');
  }
};

seedDemoUsers();
