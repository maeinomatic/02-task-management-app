/**
 * @openapi
 * /api/boards:
 *   get:
 *     summary: Get all boards
 *     tags:
 *       - Boards
 *     responses:
 *       200:
 *         description: List of boards
 *   post:
 *     summary: Create a new board
 *     tags:
 *       - Boards
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Board created
 *
 * /api/boards/{id}:
 *   get:
 *     summary: Get a board by ID
 *     tags:
 *       - Boards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board found
 *       404:
 *         description: Board not found
 *   put:
 *     summary: Update a board
 *     tags:
 *       - Boards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Board updated
 *       404:
 *         description: Board not found
 *   delete:
 *     summary: Delete a board
 *     tags:
 *       - Boards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Board deleted
 *       404:
 *         description: Board not found
 */
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