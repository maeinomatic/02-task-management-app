// Frontend types - matching backend API types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
}

export interface BoardModel {
  id: string;
  title: string;
  description?: string;
  ownerId: string;
  members: string[];
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  title: string;
  boardId: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface CardModel {
  id: string;
  title: string;
  description?: string;
  listId: string;
  position: number;
  assigneeId?: string;
  dueDate?: string;
  labels: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  content: string;
  cardId: string;
  authorId: string;
  createdAt: string;
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
  ownerId: string;
}

export interface CreateListRequest {
  title: string;
  boardId: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string;
  listId: string;
  assigneeId?: string;
  dueDate?: string;
  labels?: string[];
}

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  listId?: string;
  position?: number;
  assigneeId?: string;
  dueDate?: string;
  labels?: string[];
}

// Drag and drop types
export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
  reason: 'DROP' | 'CANCEL';
}

// Component props types
export interface BoardCardProps {
  board: BoardModel;
  onClick: (board: BoardModel) => void;
}

export interface ListProps {
  list: List;
  cards: CardModel[];
  onCardClick: (card: CardModel) => void;
  onAddCard: (listId: string) => void;
}

export interface CardProps {
  card: CardModel;
  onClick: (card: CardModel) => void;
}

// Form types
export interface BoardFormData {
  title: string;
  description: string;
}

export interface CardFormData {
  title: string;
  description: string;
  assigneeId: string;
  dueDate: string;
  labels: string[];
}