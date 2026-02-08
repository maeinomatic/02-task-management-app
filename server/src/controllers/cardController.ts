// src/controllers/cardController.ts
import type { Request, Response } from 'express';
import type { Card, ApiResponse, CreateCardRequest, UpdateCardRequest } from '../models/types.js';

// In-memory storage for now (replace with database later)
let cards: Card[] = [];
let cardIdCounter = 1;

export const getCards = async (req: Request, res: Response<ApiResponse<Card[]>>) => {
  try {
    const { listId } = req.query;

    let filteredCards = cards;
    if (listId) {
      filteredCards = cards.filter(c => c.listId === listId);
    }

    // Sort by position
    filteredCards.sort((a, b) => a.position - b.position);

    res.json({
      success: true,
      data: filteredCards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cards'
    });
  }
};

export const getCard = async (req: Request, res: Response<ApiResponse<Card>>) => {
  try {
    const { id } = req.params;
    const card = cards.find(c => c.id === id);

    if (!card) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch card'
    });
  }
};

export const createCard = async (req: Request<{}, {}, CreateCardRequest>, res: Response<ApiResponse<Card>>) => {
  try {
    const { title, description, listId, assigneeId, dueDate, labels } = req.body;

    if (!title || !listId) {
      return res.status(400).json({
        success: false,
        error: 'Title and listId are required'
      });
    }

    // Get the highest position in the list
    const listCards = cards.filter(c => c.listId === listId);
    const position = listCards.length > 0 ? Math.max(...listCards.map(c => c.position)) + 1 : 0;

    const newCard: Card = {
      id: cardIdCounter.toString(),
      title,
      ...(description && { description }),
      listId,
      position,
      ...(assigneeId && { assigneeId }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
      labels: labels || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    cards.push(newCard);
    cardIdCounter++;

    res.status(201).json({
      success: true,
      data: newCard,
      message: 'Card created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create card'
    });
  }
};

export const updateCard = async (req: Request<{ id: string }, {}, UpdateCardRequest>, res: Response<ApiResponse<Card>>) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const cardIndex = cards.findIndex(c => c.id === id);

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    // Handle position updates (reordering)
    if (updates.position !== undefined && updates.listId) {
      // Move card to new position in the same or different list
      const sameListCards = cards.filter(c => c.listId === updates.listId && c.id !== id);
      sameListCards.forEach(card => {
        if (card.position >= updates.position!) {
          card.position++;
        }
      });
    }

    const currentCard = cards[cardIndex]!;
    const updatedCard: Card = {
      id: currentCard.id,
      title: updates.title ?? currentCard.title,
      ...(updates.description !== undefined && { description: updates.description }),
      ...(currentCard.description !== undefined && updates.description === undefined && { description: currentCard.description }),
      listId: updates.listId ?? currentCard.listId,
      position: updates.position ?? currentCard.position,
      ...(updates.assigneeId !== undefined && { assigneeId: updates.assigneeId }),
      ...(currentCard.assigneeId !== undefined && updates.assigneeId === undefined && { assigneeId: currentCard.assigneeId }),
      ...(updates.dueDate !== undefined && { dueDate: updates.dueDate }),
      ...(currentCard.dueDate !== undefined && updates.dueDate === undefined && { dueDate: currentCard.dueDate }),
      labels: updates.labels ?? currentCard.labels,
      createdAt: currentCard.createdAt,
      updatedAt: new Date()
    };

    cards[cardIndex] = updatedCard;

    res.json({
      success: true,
      data: updatedCard,
      message: 'Card updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update card'
    });
  }
};

export const deleteCard = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { id } = req.params;
    const cardIndex = cards.findIndex(c => c.id === id);

    if (cardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Card not found'
      });
    }

    cards.splice(cardIndex, 1);

    res.json({
      success: true,
      message: 'Card deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete card'
    });
  }
};