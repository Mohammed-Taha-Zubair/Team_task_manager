const express = require('express');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Team = require('../models/Team');
const Comment = require('../models/Comment');
const logActivity = require('../utils/activity');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
};

// Helper to verify task existence and team membership
const getTaskAndVerifyMembership = async (taskId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(taskId)) {
    return { errorStatus: 404, errorMessage: 'Task not found' };
  }

  const task = await Task.findById(taskId);
  if (!task) {
    return { errorStatus: 404, errorMessage: 'Task not found' };
  }

  const team = await Team.findById(task.team);
  if (!team || !team.members.some((m) => m.toString() === userId.toString())) {
    return { errorStatus: 403, errorMessage: 'Forbidden: You are not a member of this team' };
  }

  return { task, team };
};

// GET /api/tasks/:taskId
router.get('/:taskId', authenticate, async (req, res) => {
  try {
    const { task, errorStatus, errorMessage } = await getTaskAndVerifyMembership(
      req.params.taskId,
      req.user._id
    );

    if (errorStatus) {
      return res.status(errorStatus).json({ message: errorMessage });
    }

    await task.populate('assignedTo', 'name email');
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PATCH /api/tasks/:taskId
router.patch('/:taskId', authenticate, async (req, res) => {
  try {
    const { task, team, errorStatus, errorMessage } = await getTaskAndVerifyMembership(
      req.params.taskId,
      req.user._id
    );

    if (errorStatus) {
      return res.status(errorStatus).json({ message: errorMessage });
    }

    const { title, description, assignedTo, status } = req.body;
    let statusChanged = false;
    let otherFieldsChanged = false;

    if (title !== undefined) {
      if (!title || !title.trim()) {
        return res.status(400).json({ message: 'Title cannot be empty' });
      }
      if (task.title !== title.trim()) {
        task.title = title.trim();
        otherFieldsChanged = true;
      }
    }

    if (description !== undefined) {
      if (task.description !== description.trim()) {
        task.description = description.trim();
        otherFieldsChanged = true;
      }
    }

    if (assignedTo !== undefined) {
      if (assignedTo === null || assignedTo === '') {
        if (task.assignedTo) {
          task.assignedTo = null;
          otherFieldsChanged = true;
        }
      } else {
        if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
          return res.status(400).json({ message: 'Invalid assignedTo user ID' });
        }
        const isMember = team.members.some((m) => m.toString() === assignedTo.toString());
        if (!isMember) {
          return res.status(400).json({ message: 'Assigned user must be a member of the team' });
        }
        if (!task.assignedTo || task.assignedTo.toString() !== assignedTo.toString()) {
          task.assignedTo = assignedTo;
          otherFieldsChanged = true;
        }
      }
    }

    if (status !== undefined) {
      if (!STATUS_LABELS[status]) {
        return res.status(400).json({ message: 'Status must be pending, in_progress, or done' });
      }
      if (task.status !== status) {
        task.status = status;
        statusChanged = true;
      }
    }

    await task.save();

    if (statusChanged) {
      await logActivity(
        task.team,
        req.user._id,
        `${req.user.name} changed status of "${task.title}" to ${STATUS_LABELS[task.status]}.`,
        task._id
      );
    } else if (otherFieldsChanged) {
      await logActivity(
        task.team,
        req.user._id,
        `${req.user.name} updated task "${task.title}"`,
        task._id
      );
    }

    await task.populate('assignedTo', 'name email');
    return res.json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// GET /api/tasks/:taskId/comments
router.get('/:taskId/comments', authenticate, async (req, res) => {
  try {
    const { task, errorStatus, errorMessage } = await getTaskAndVerifyMembership(
      req.params.taskId,
      req.user._id
    );

    if (errorStatus) {
      return res.status(errorStatus).json({ message: errorMessage });
    }

    const comments = await Comment.find({ task: task._id })
      .populate('user', 'name')
      .sort({ createdAt: 1 });

    return res.json(comments);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/tasks/:taskId/comments
router.post('/:taskId/comments', authenticate, async (req, res) => {
  try {
    const { task, errorStatus, errorMessage } = await getTaskAndVerifyMembership(
      req.params.taskId,
      req.user._id
    );

    if (errorStatus) {
      return res.status(errorStatus).json({ message: errorMessage });
    }

    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const comment = await Comment.create({
      task: task._id,
      user: req.user._id,
      text: text.trim(),
    });

    await logActivity(
      task.team,
      req.user._id,
      `${req.user.name} commented on "${task.title}"`,
      task._id
    );

    await comment.populate('user', 'name');
    return res.status(201).json(comment);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' });
  }
});

module.exports = router;
