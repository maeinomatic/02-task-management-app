/**
 * @openapi
 * /api/cards:
 *   get:
 *     summary: Get all cards
 *     tags:
 *       - Cards
 *     responses:
 *       200:
 *         description: List of cards
 *   post:
 *     summary: Create a new card
 *     tags:
 *       - Cards
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
 *               listId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Card created
 *
 * /api/cards/{id}:
 *   get:
 *     summary: Get a card by ID
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card found
 *       404:
 *         description: Card not found
 *   put:
 *     summary: Update a card
 *     tags:
 *       - Cards
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
 *               listId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Card updated
 *       404:
 *         description: Card not found
 *   delete:
 *     summary: Delete a card
 *     tags:
 *       - Cards
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Card deleted
 *       404:
 *         description: Card not found
 */
// src/routes/cards.ts
import express from 'express';
import { getCards, getCard, createCard, updateCard, deleteCard } from '../controllers/cardController.js';

const router = express.Router();

// GET /api/cards - Get all cards (optionally filter by listId)
router.get('/', getCards);

// GET /api/cards/:id - Get single card
router.get('/:id', getCard);

// POST /api/cards - Create new card
router.post('/', createCard);

// PUT /api/cards/:id - Update card
router.put('/:id', updateCard);

// DELETE /api/cards/:id - Delete card
router.delete('/:id', deleteCard);

export default router;