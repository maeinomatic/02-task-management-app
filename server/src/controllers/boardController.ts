// src/controllers/boardController.ts
import type { Request, Response } from 'express';
import type { Board as ApiBoard, ApiResponse, CreateBoardRequest } from '../models/types.js';
import boardsRepo from '../repositories/boardsRepository.js';
import { mapRepoToApi } from '../mappers/boardMapper.js';

// CREATE
export const createBoard = async (req: Request<{}, {}, CreateBoardRequest>, res: Response<ApiResponse<ApiBoard>>) => {
  try {
    const { title, description } = req.body;
    if (!title) return res.status(400).json({ success: false, error: 'Title is required' });
    const created = await boardsRepo.create({ title, description });
    res.status(201).json({ success: true, data: mapRepoToApi(created), message: 'Board created successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create board' });
  }
};

//READ
export const getBoard = async (req: Request, res: Response<ApiResponse<ApiBoard>>) => {
  try {
    const { id } = req.params;
    const row = await boardsRepo.getById(id);
    if (!row) return res.status(404).json({ success: false, error: 'Board not found' });
    res.json({ success: true, data: mapRepoToApi(row) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch board' });
  }
};

export const getBoards = async (_req: Request, res: Response<ApiResponse<ApiBoard[]>>) => {
  try {
    console.log('[boardController] getBoards called, boardsRepo is:', boardsRepo ? 'defined' : 'null');
    const rows = await boardsRepo.getAll();
    console.log('[boardController] got rows:', rows);
    const data = (rows ?? []).map(mapRepoToApi);
    res.json({ success: true, data });
  } catch (error) {
    console.error('[boardController] getBoards caught error:', error instanceof Error ? error.message : String(error));
    if (error instanceof Error) {
      console.error('[boardController] error stack:', error.stack);
    }
    res.status(500).json({ success: false, error: 'Failed to fetch boards' });
  }
};

//UPDATE
export const updateBoard = async (_req: Request, res: Response<ApiResponse<ApiBoard>>) => {
  // Update not implemented in repository abstraction yet
  res.status(501).json({ success: false, error: 'Update not implemented' });
};

//DELETE
export const deleteBoard = async (req: Request, res: Response<ApiResponse<null>>) => {
  try {
    const { id } = req.params;
    await boardsRepo.delete(id);
    res.json({ success: true, message: 'Board deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete board' });
  }
};