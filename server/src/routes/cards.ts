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