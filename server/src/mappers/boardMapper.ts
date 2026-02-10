import type { Board as ApiBoard } from '../models/types.js';

export function mapRepoToApi(board: any): ApiBoard {
  if (!board) return board;
  const createdAt = board.createdAt ? new Date(board.createdAt) : new Date();
  return {
    id: String(board.id),
    title: board.title,
    description: board.description ?? undefined,
    ownerId: (board.ownerId as string) ?? 'user1',
    members: (board.members as string[]) ?? ['user1'],
    createdAt,
    updatedAt: board.updatedAt ? new Date(board.updatedAt) : createdAt,
  };
}
