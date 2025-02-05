const express = require('express');
const router = express.Router();
const {
  getTasks,
  createTask,
  updateTaskStatus,
  updateTaskTimer,
} = require('../controllers/taskController');

// Getting tasks for a user
router.get('/:userId', getTasks);

// Creating a new task
router.post('/', createTask);

// Updating task status
router.put('/:id', updateTaskStatus);

// Updating task time tracking (Start/Stop Timer)
router.put('/:taskId/updateTaskTimer', updateTaskTimer);

module.exports = router;
