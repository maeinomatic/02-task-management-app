// src/controllers/boardController.ts
import type { Request, Response } from 'express';
import type { Board, ApiResponse, CreateBoardRequest } from '../models/types.js';

// In-memory storage for now (replace with database later)
let boards: Board[] = [];
let boardIdCounter = 1;

export const getBoards = async (req: Request, res: Response<ApiResponse<Board[]>>) => {
  try {
    // TODO: Filter by user permissions
    res.json({
      success: true,
      data: boards
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch boards'
    });
  }
};

export const getBoard = async (req: Request, res: Response<ApiResponse<Board>>) => {
  try {
    const { id } = req.params;
    const board = boards.find(b => b.id === id);

    if (!board) {
      return res.status(404).json({
        success: false,
        error: 'Board not found'
      });
    }

    res.json({
      success: true,
      data: board
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch board'
    });
  }
};

export const createBoard = async (req: Request<{}, {}, CreateBoardRequest>, res: Response<ApiResponse<Board>>) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required'
      });
    }

    const newBoard: Board = {
      id: boardIdCounter.toString(),
      title,
      ...(description && { description }),
      ownerId: 'user1', // TODO: Get from auth
      members: ['user1'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    boards.push(newBoard);
    boardIdCounter++;

    res.status(201).json({
      success: true,
      data: newBoard,
      message: 'Board created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create board'
    });
  }
};

export const updateBoard = async (req: Request, res: Response<ApiResponse<Board>>) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const boardIndex = boards.findIndex(b => b.id === id);

    if (boardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Board not found'
      });
    }

    boards[boardIndex] = {
      ...boards[boardIndex],
      ...updates,
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: boards[boardIndex]!,
      message: 'Board updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update board'
    });
  }
};

export const deleteBoard = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { id } = req.params;
    const boardIndex = boards.findIndex(b => b.id === id);

    if (boardIndex === -1) {
      return res.status(404).json({
        success: false,
        error: 'Board not found'
      });
    }

    boards.splice(boardIndex, 1);

    res.json({
      success: true,
      message: 'Board deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete board'
    });
  }
};