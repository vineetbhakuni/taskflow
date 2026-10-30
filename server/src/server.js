import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import taskRoutes from './routes/taskRoutes.js';

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'taskflow-api' }));
app.use('/api/tasks', taskRoutes);

app.use((error, _req, res, _next) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: Object.values(error.errors).map(({ message }) => message).join(', ')
    });
  }
  if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid task id' });
  console.error(error);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow');
    app.listen(port, () => console.log(`TaskFlow API running on port ${port}`));
  } catch (error) {
    console.error('Unable to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

startServer();
