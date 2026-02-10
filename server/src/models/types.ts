// src/models/types.ts
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: Date;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: string[]; // user IDs
  createdAt: Date;
  updatedAt: Date;
}

export interface BoardColumn {
  id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position: number;
  assigneeId?: string;
  dueDate?: Date;
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  authorId: string;
  createdAt: Date;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Request types
export interface CreateBoardRequest {
  title: string;
  description?: string;
}

export interface CreateColumnRequest {
  title: string;
  boardId: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  listId: string;
  assigneeId?: string;
  dueDate?: Date;
  labels?: string[];
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  listId?: string;
  position?: number;
  assigneeId?: string;
  dueDate?: Date;
  labels?: string[];
}