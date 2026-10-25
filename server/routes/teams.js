const express = require('express');
const mongoose = require('mongoose');
const Team = require('../models/Team');
const User = require('../models/User');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const logActivity = require('../utils/activity');
const { authenticate, requireAdmin, requireTeamMember } = require('../middleware/auth');

const router = express.Router();

// POST /api/teams (admin only)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Team name is required' });
    }

    const team = await Team.create({
      name: name.trim(),
      description: (description || '').trim(),
      createdBy: req.user._id,
      members: [req.user._id],
    });

    return res.status(201).json(team);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/teams (logged-in user's teams)
router.get('/', authenticate, async (req, res) => {
  try {
    const teams = await Team.find({ members: req.user._id }).sort({ createdAt: -1 });
    return res.json(teams);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/teams/:id (team members only)
router.get('/:id', authenticate, requireTeamMember, async (req, res) => {
  try {
    await req.team.populate('members', 'name email role');
    return res.json(req.team);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/teams/:id/invite (admin only, must be a team member)
router.post('/:id', authenticate, requireAdmin, requireTeamMember, (req, res, next) => next()); // pass-through
router.post('/:id/invite', authenticate, requireAdmin, requireTeamMember, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    console.log(`Invitation sent to ${normalizedEmail}`);

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'User must register first before joining a team' });
    }

    const alreadyMember = req.team.members.some(
      (memberId) => memberId.toString() === user._id.toString()
    );

    if (alreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this team' });
    }

    req.team.members.push(user._id);
    await req.team.save();

    await logActivity(req.team._id, req.user._id, `${req.user.name} invited ${user.name} to the team`);

    return res.json({ message: 'User added to team successfully', team: req.team });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/teams/:id/tasks (team members only)
router.post('/:id/tasks', authenticate, requireTeamMember, async (req, res) => {
  try {
    const { title, description, assignedTo, status } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const validStatuses = ['pending', 'in_progress', 'done'];
    const taskStatus = status || 'pending';
    if (!validStatuses.includes(taskStatus)) {
      return res.status(400).json({ message: 'Status must be pending, in_progress, or done' });
    }

    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ message: 'Invalid assignedTo user ID' });
      }

      const isMember = req.team.members.some(
        (memberId) => memberId.toString() === assignedTo.toString()
      );
      if (!isMember) {
        return res.status(400).json({ message: 'Assigned user must be a member of the team' });
      }
    }

    const task = await Task.create({
      title: title.trim(),
      description: (description || '').trim(),
      assignedTo: assignedTo || null,
      status: taskStatus,
      team: req.team._id,
    });

    await logActivity(
      req.team._id,
      req.user._id,
      `${req.user.name} created task "${task.title}"`,
      task._id
    );

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/teams/:id/tasks?status= (team members only)
router.get('/:id/tasks', authenticate, requireTeamMember, async (req, res) => {
  try {
    const filter = { team: req.team._id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/teams/:id/activity (team members only)
router.get('/:id/activity', authenticate, requireTeamMember, async (req, res) => {
  try {
    const activities = await Activity.find({ team: req.team._id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return res.json(activities);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
