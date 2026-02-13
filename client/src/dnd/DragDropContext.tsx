import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DropResult, DraggableLocation } from './types';

type RegisteredDroppable = {
  id: string;
  element: HTMLElement;
};

type RegisteredDraggable = {
  id: string;
  droppableId: string;
  index: number;
  element: HTMLElement;
};

type DragState = {
  draggableId: string;
  source: DraggableLocation;
  destination: DraggableLocation | null;
} | null;

type DndContextValue = {
  dragState: DragState;
  registerDroppable: (id: string, el: HTMLElement) => void;
  unregisterDroppable: (id: string) => void;
  registerDraggable: (id: string, droppableId: string, index: number, el: HTMLElement) => void;
  unregisterDraggable: (id: string) => void;
  updateDraggableIndex: (id: string, index: number, droppableId: string) => void;
  startDrag: (draggableId: string, source: DraggableLocation, event: React.PointerEvent<HTMLElement>) => void;
};

const DndContext = createContext<DndContextValue | null>(null);

const getDistanceToRect = (x: number, y: number, rect: DOMRect) => {
  const dx = x < rect.left ? rect.left - x : x > rect.right ? x - rect.right : 0;
  const dy = y < rect.top ? rect.top - y : y > rect.bottom ? y - rect.bottom : 0;
  return Math.hypot(dx, dy);
};

export const DragDropContext: React.FC<{
  onDragEnd: (result: DropResult) => void;
  children: React.ReactNode;
}> = ({ onDragEnd, children }) => {
  const droppablesRef = useRef(new Map<string, RegisteredDroppable>());
  const draggablesRef = useRef(new Map<string, RegisteredDraggable>());
  const [dragState, setDragState] = useState<DragState>(null);
  const dragStateRef = useRef<DragState>(null);
  const teardownListenersRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    dragStateRef.current = dragState;
  }, [dragState]);

  const computeDestination = (x: number, y: number, draggingId: string): DraggableLocation | null => {
    const droppables = Array.from(droppablesRef.current.values());
    if (droppables.length === 0) return null;

    const inside = droppables.filter(d => {
      const r = d.element.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    });

    const chosen = (inside.length > 0 ? inside : droppables)
      .map(d => ({ d, dist: getDistanceToRect(x, y, d.element.getBoundingClientRect()) }))
      .sort((a, b) => a.dist - b.dist)[0]?.d;

    if (!chosen) return null;

    const siblings = Array.from(draggablesRef.current.values())
      .filter(item => item.droppableId === chosen.id && item.id !== draggingId)
      .sort((a, b) => a.index - b.index);

    if (siblings.length === 0) {
      return { droppableId: chosen.id, index: 0 };
    }

    const index = siblings.findIndex(item => {
      const rect = item.element.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      return y < centerY;
    });

    return {
      droppableId: chosen.id,
      index: index === -1 ? siblings.length : index,
    };
  };

  const endDrag = (reason: 'DROP' | 'CANCEL') => {
    const current = dragStateRef.current;
    if (!current) return;

    const result: DropResult = {
      draggableId: current.draggableId,
      source: current.source,
      destination: reason === 'DROP' ? current.destination : null,
      reason,
    };

    setDragState(null);
    dragStateRef.current = null;
    document.body.style.userSelect = '';
    onDragEnd(result);
  };

  useEffect(() => {
    return () => {
      if (teardownListenersRef.current) {
        teardownListenersRef.current();
      }
      document.body.style.userSelect = '';
    };
  }, []);

  const startDrag = (draggableId: string, source: DraggableLocation, event: React.PointerEvent<HTMLElement>) => {
    event.preventDefault();

    const initialDestination = computeDestination(event.clientX, event.clientY, draggableId);
    setDragState({ draggableId, source, destination: initialDestination });
    dragStateRef.current = { draggableId, source, destination: initialDestination };

    document.body.style.userSelect = 'none';

    const onMove = (ev: PointerEvent) => {
      const current = dragStateRef.current;
      if (!current) return;
      const destination = computeDestination(ev.clientX, ev.clientY, current.draggableId);
      const next = { ...current, destination };
      dragStateRef.current = next;
      setDragState(next);
    };

    const onUp = () => {
      if (teardownListenersRef.current) {
        teardownListenersRef.current();
      }
      endDrag('DROP');
    };

    const onCancel = () => {
      if (teardownListenersRef.current) {
        teardownListenersRef.current();
      }
      endDrag('CANCEL');
    };

    teardownListenersRef.current = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      teardownListenersRef.current = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
  };

  const value = useMemo<DndContextValue>(() => ({
    dragState,
    registerDroppable: (id, element) => {
      droppablesRef.current.set(id, { id, element });
    },
    unregisterDroppable: (id) => {
      droppablesRef.current.delete(id);
    },
    registerDraggable: (id, droppableId, index, element) => {
      draggablesRef.current.set(id, { id, droppableId, index, element });
    },
    unregisterDraggable: (id) => {
      draggablesRef.current.delete(id);
    },
    updateDraggableIndex: (id, index, droppableId) => {
      const existing = draggablesRef.current.get(id);
      if (existing) {
        existing.index = index;
        existing.droppableId = droppableId;
      }
    },
    startDrag,
  }), [dragState]);

  return <DndContext.Provider value={value}>{children}</DndContext.Provider>;
};

export const useDragDropContext = () => {
  const ctx = useContext(DndContext);
  if (!ctx) throw new Error('useDragDropContext must be used within DragDropContext');
  return ctx;
};
