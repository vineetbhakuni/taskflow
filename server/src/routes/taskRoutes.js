import express from 'express';
import Task from '../models/Task.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { status = 'all', search = '' } = req.query;
    const filter = {};

    if (status === 'completed') filter.completed = true;
    if (status === 'pending') filter.completed = false;
    if (search.trim()) filter.title = { $regex: search.trim(), $options: 'i' };

    const tasks = await Task.find(filter).sort({ completed: 1, dueDate: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { title, description, priority, dueDate } = req.body;
    const task = await Task.create({ title, description, priority, dueDate: dueDate || null });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const allowedFields = ['title', 'description', 'priority', 'dueDate', 'completed'];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowedFields.includes(key))
    );
    if ('dueDate' in updates && !updates.dueDate) updates.dueDate = null;

    const task = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
