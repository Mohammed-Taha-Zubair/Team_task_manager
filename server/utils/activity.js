/** @format */

const Activity = require("../models/Activity").default;

const logActivity = async (teamId, userId, message, taskId = null) => {
  try {
    return await Activity.create({
      team: teamId,
      user: userId,
      message,
      task: taskId,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

module.exports = logActivity;
