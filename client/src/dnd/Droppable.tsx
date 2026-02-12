import React, { useEffect, useRef } from 'react';
import { useDragDropContext } from './DragDropContext';
import { DroppableSnapshot } from './types';

type Provided = {
  innerRef: (el: HTMLElement | null) => void;
  droppableProps: React.HTMLAttributes<HTMLElement>;
  placeholder: React.ReactNode;
};

export const Droppable: React.FC<{
  droppableId: string;
  children: (provided: Provided, snapshot: DroppableSnapshot) => React.ReactNode;
}> = ({ droppableId, children }) => {
  const { registerDroppable, unregisterDroppable, dragState } = useDragDropContext();
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (ref.current) registerDroppable(droppableId, ref.current);
    return () => unregisterDroppable(droppableId);
  }, [droppableId, registerDroppable, unregisterDroppable]);

  const snapshot: DroppableSnapshot = {
    isDraggingOver: !!dragState?.destination && dragState.destination.droppableId === droppableId,
  };

  const provided: Provided = {
    innerRef: (el) => {
      ref.current = el;
      if (el) registerDroppable(droppableId, el);
    },
    droppableProps: {},
    placeholder: null,
  };

  return <>{children(provided, snapshot)}</>;
};
