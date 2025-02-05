const mongoose = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User'); // Ensure this is required for populating users

// Getting tasks for a user
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.params.userId })
      .populate('assignedTo', 'name')
      .populate('assignedBy', 'name');
    
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Creating a new task for user
const createTask = async (req, res) => {
  const { title, description, assignedTo, assignedBy, deadline } = req.body;
  try {
    const newTask = new Task({ title, description, assignedTo, assignedBy, deadline });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Updating task status of user
const updateTaskStatus = async (req, res) => {
  const { status } = req.body;
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    task.status = status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};


// Updating task time tracking (start/stop timer)
const updateTaskTimer = async (req, res) => {
  const { taskId, action, userId } = req.body;

  if (!taskId || !action || !userId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  if (!mongoose.isValidObjectId(taskId) || !mongoose.isValidObjectId(userId)) {
    return res.status(400).json({ error: 'Invalid task or user ID' });
  }

  if (action !== 'start' && action !== 'stop') {
    return res.status(400).json({ error: 'Invalid action, must be "start" or "stop"' });
  }

  try {
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const currentTimestamp = new Date();

    if (action === 'start') {
      if (task.timeStarted) {
        return res.status(400).json({ error: 'Timer already started' });
      }

      task.timeStarted = currentTimestamp;
      task.actionHistory.push({
        action: 'start',
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: currentTimestamp,
      });
    }

    if (action === 'stop') {
      if (!task.timeStarted) {
        return res.status(400).json({ error: 'Timer not started' });
      }

      const timeSpent = Math.floor((currentTimestamp - new Date(task.timeStarted)) / 1000);
      task.timeSpent += timeSpent;
      task.timeStarted = null;
      task.actionHistory.push({
        action: 'stop',
        userId: new mongoose.Types.ObjectId(userId),
        timestamp: currentTimestamp,
      });
    }

    const updatedTask = await task.save();

   
    res.status(200).json({
      timeSpent: updatedTask.timeSpent,
      timeStarted: updatedTask.timeStarted,  
      actionHistory: updatedTask.actionHistory,
    });
  } catch (error) {
    console.error('Error updating timer:', error);
    res.status(500).json({ error: 'Server error' });
  }
};







module.exports = { getTasks, createTask, updateTaskStatus, updateTaskTimer };
