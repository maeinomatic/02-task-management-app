// src/routes/boards.ts
import express from 'express';
import { getBoards, getBoard, createBoard, updateBoard, deleteBoard } from '../controllers/boardController.js';

const router = express.Router();

// GET /api/boards - Get all boards
router.get('/', (req, res) => {
  console.log('GET /api/boards called');
  getBoards(req, res);
});

// GET /api/boards/:id - Get single board
router.get('/:id', getBoard);

// POST /api/boards - Create new board
router.post('/', createBoard);

// PUT /api/boards/:id - Update board
router.put('/:id', updateBoard);

// DELETE /api/boards/:id - Delete board
router.delete('/:id', deleteBoard);

export default router;