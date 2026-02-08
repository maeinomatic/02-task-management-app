import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardRoutes from './routes/boards.js';
import cardRoutes from './routes/cards.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// API Routes
console.log('Setting up routes...');
app.use('/api/boards', boardRoutes);
console.log('Board routes set up');
app.use('/api/cards', cardRoutes);
console.log('Card routes set up');

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
