const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');
const Emergency = require('../models/Emergency');
const Resource = require('../models/Resource');
const Volunteer = require('../models/Volunteer');

// Load environment variables from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDemoData = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/signalx';
  try {
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected for seeding all demo data.');

    // 1. Seed demo users
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

    const usersMap = {};
    for (const u of demoUsers) {
      let user = await User.findOne({ email: u.email });
      if (user) {
        user.name = u.name;
        user.role = u.role;
        user.password = u.password;
        await user.save();
        console.log(`Successfully updated user: ${u.email}`);
      } else {
        user = await User.create(u);
        console.log(`Successfully created user: ${u.email}`);
      }
      usersMap[u.role] = user;
    }

    const adminUser = usersMap['Admin'];
    const volunteerUser = usersMap['Volunteer'];

    // 2. Seed resources
    const demoResources = [
      {
        name: 'Purified Water Gallons',
        category: 'Water',
        totalQuantity: 200,
        availableQuantity: 200,
        location: 'Sector 18 Warehouse A',
        contactName: 'Warehouse Supervisor',
        contactPhone: '555-987-6543',
        createdBy: adminUser._id
      },
      {
        name: 'Trauma Trauma Kits (Class III)',
        category: 'Medical',
        totalQuantity: 50,
        availableQuantity: 50,
        location: 'Sector 4 Relief Depot',
        contactName: 'Medical Lead Jane',
        contactPhone: '555-123-4567',
        createdBy: adminUser._id
      },
      {
        name: 'Tactical Evacuation Vehicles',
        category: 'Transport',
        totalQuantity: 5,
        availableQuantity: 5,
        location: 'Sector 9 Transport Yard',
        contactName: 'Logistics Sub-Officer',
        contactPhone: '555-555-8888',
        createdBy: adminUser._id
      }
    ];

    for (const r of demoResources) {
      const existing = await Resource.findOne({ name: r.name });
      if (!existing) {
        await Resource.create(r);
        console.log(`Successfully seeded resource: ${r.name}`);
      } else {
        console.log(`Resource already exists: ${r.name}`);
      }
    }

    // 3. Seed emergencies
    const demoEmergencies = [
      {
        title: 'Building Fire Outbreak',
        description: 'Commercial facility fire in sector 18. Potential electrical hazard. Immediate fire response required.',
        category: 'Fire',
        priority: 'High',
        location: 'Sector 18 industrial zone',
        reporter: 'Citizen Sensor',
        createdBy: adminUser._id
      },
      {
        title: 'Medical Triage Zone A',
        description: 'Triage setup for incoming evacuees needing medical screenings and trauma support.',
        category: 'Medical',
        priority: 'Medium',
        location: 'Sector 4 Evac Station',
        reporter: 'Field Doctor',
        createdBy: adminUser._id
      }
    ];

    for (const e of demoEmergencies) {
      const existing = await Emergency.findOne({ title: e.title });
      if (!existing) {
        await Emergency.create(e);
        console.log(`Successfully seeded emergency: ${e.title}`);
      } else {
        console.log(`Emergency already exists: ${e.title}`);
      }
    }

    // 4. Seed Volunteer profile (associated with volunteer user)
    const existingProfile = await Volunteer.findOne({ user: volunteerUser._id });
    if (!existingProfile) {
      await Volunteer.create({
        user: volunteerUser._id,
        name: 'Volunteer User',
        phone: '9876543210',
        location: 'Sector 18',
        skills: ['Medical', 'Search and Rescue'],
        availability: 'Available'
      });
      console.log('Successfully seeded volunteer profile.');
    } else {
      console.log('Volunteer profile already exists.');
    }

    console.log('Idempotent seeding completed successfully.');
  } catch (err) {
    console.error('Seeding error:', err.message);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDemoData();
