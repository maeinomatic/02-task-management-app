export type DraggableLocation = {
  droppableId: string;
  index: number;
};

export type DropResult = {
  draggableId: string;
  source: DraggableLocation;
  destination: DraggableLocation | null;
  reason: 'DROP' | 'CANCEL';
};

export type DragStart = {
  draggableId: string;
  source: DraggableLocation;
};

export type DraggableSnapshot = {
  isDragging: boolean;
};

export type DroppableSnapshot = {
  isDraggingOver: boolean;
};
