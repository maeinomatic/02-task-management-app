import React, { useEffect, useRef } from 'react';
import { useDragDropContext } from './DragDropContext';
import { DraggableSnapshot } from './types';

type Provided = {
  innerRef: (el: HTMLElement | null) => void;
  draggableProps: React.HTMLAttributes<HTMLElement>;
  dragHandleProps: React.HTMLAttributes<HTMLElement>;
};

export const Draggable: React.FC<{
  draggableId: string;
  index: number;
  droppableId: string;
  children: (provided: Provided, snapshot: DraggableSnapshot) => React.ReactNode;
}> = ({ draggableId, index, droppableId, children }) => {
  const { registerDraggable, unregisterDraggable, updateDraggableIndex, startDrag, dragState } = useDragDropContext();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (ref.current) registerDraggable(draggableId, droppableId, index, ref.current);
    return () => unregisterDraggable(draggableId);
  }, [draggableId, droppableId, index, registerDraggable, unregisterDraggable]);

  useEffect(() => {
    updateDraggableIndex(draggableId, index, droppableId);
  }, [draggableId, index, droppableId, updateDraggableIndex]);

  const isDragging = dragState?.draggableId === draggableId;

  const provided: Provided = {
    innerRef: (el) => {
      ref.current = el;
      if (el) registerDraggable(draggableId, droppableId, index, el);
    },
    draggableProps: {
      style: isDragging ? ({ opacity: 0.4 } as React.CSSProperties) : undefined,
    },
    dragHandleProps: {
      onPointerDown: (e) => {
        startDrag(draggableId, { droppableId, index }, e as React.PointerEvent<HTMLElement>);
      },
    },
  };

  const snapshot: DraggableSnapshot = { isDragging };

  return <>{children(provided, snapshot)}</>;
};
