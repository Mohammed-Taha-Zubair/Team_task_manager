/** @format */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./models/User');
const Team = require('./models/Team');
const Task = require('./models/Task');
const Comment = require('./models/Comment');
const Activity = require('./models/Activity');

const MONGO_URI =
  process.env.MONGO_URI || 'mongodb://localhost:27017/team_task_tracker';

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Team.deleteMany({}),
      Task.deleteMany({}),
      Comment.deleteMany({}),
      Activity.deleteMany({}),
    ]);

    console.log('Creating users matching api.http...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
    });

    const memberUser = await User.create({
      name: 'Member User',
      email: 'member@example.com',
      password: hashedPassword,
      role: 'member',
    });

    console.log('Creating team...');
    const engineeringTeam = await Team.create({
      name: 'Engineering Team',
      description: 'Product engineering',
      createdBy: adminUser._id,
      members: [adminUser._id, memberUser._id],
    });

    // Activity: Admin invites member
    await Activity.create({
      team: engineeringTeam._id,
      user: adminUser._id,
      message: `${adminUser.name} invited ${memberUser.name} to the team`,
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
    });

    console.log('Creating task...');
    const task = await Task.create({
      title: 'Design API endpoints',
      description: 'Define routes and middleware',
      status: 'in_progress',
      team: engineeringTeam._id,
      assignedTo: memberUser._id,
    });

    // Activity: Admin created task
    await Activity.create({
      team: engineeringTeam._id,
      user: adminUser._id,
      task: task._id,
      message: `${adminUser.name} created task "${task.title}"`,
      createdAt: new Date(Date.now() - 20 * 60 * 1000), // 20 min ago
    });

    // Activity: Member changed status
    await Activity.create({
      team: engineeringTeam._id,
      user: memberUser._id,
      task: task._id,
      message: `${memberUser.name} changed status of "${task.title}" to In Progress.`,
      createdAt: new Date(Date.now() - 10 * 60 * 1000), // 10 min ago
    });

    console.log('Creating comment...');
    const comment = await Comment.create({
      task: task._id,
      user: memberUser._id,
      text: 'Status changed to In Progress, working on it now.',
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 min ago
    });

    // Activity: Member commented
    await Activity.create({
      team: engineeringTeam._id,
      user: memberUser._id,
      task: task._id,
      message: `${memberUser.name} commented on "${task.title}"`,
      createdAt: new Date(Date.now() - 5 * 60 * 1000),
    });

    console.log('\n--- Seeding completed successfully! ---');
    console.log('Admin:  admin@example.com / password123 (role: admin)');
    console.log('Member: member@example.com / password123 (role: member)');
    console.log('Team:   Engineering Team');
    console.log('Task:   Design API endpoints (in_progress)');
    console.log('Comment: "Status changed to In Progress, working on it now."');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
