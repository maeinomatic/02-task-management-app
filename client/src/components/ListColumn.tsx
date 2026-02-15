import React, { useState } from 'react';
import { List, CardModel } from '../types';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import CardItem from './CardItem';
import { createCard } from '../store/slices/cardsSlice';
import { updateList, deleteList } from '../store/slices/listsSlice';
import { Droppable, Draggable } from '../dnd';

interface Props {
  list: List;
  cards: CardModel[];
  dragHandleProps?: React.HTMLAttributes<HTMLElement>;
}

const ListColumn: React.FC<Props> = ({ list, cards, dragHandleProps }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(list.title);
  const [busy, setBusy] = useState(false);

  const [showComposer, setShowComposer] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const openComposer = () => {
    setShowComposer(true);
    setNewTitle('');
  };

  const submitNewCard = async () => {
    if (!newTitle || !newTitle.trim()) return;
    setBusy(true);
    try {
      const listIdPayload: any =
        typeof list.id === 'number'
          ? list.id
          : (typeof list.id === 'string' &&
             list.id.trim() !== '' &&
             /^[0-9]+$/.test(list.id.trim())
              ? Number(list.id.trim())
              : list.id);
      await dispatch(createCard({ title: newTitle.trim(), listId: listIdPayload })).unwrap();
      setNewTitle('');
      setShowComposer(false);
    } catch {
      alert('Failed to create card. Check console for details.');
    } finally {
      setBusy(false);
    }
  };

  const cancelComposer = () => {
    setShowComposer(false);
    setNewTitle('');
  };

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') submitNewCard();
    if (e.key === 'Escape') cancelComposer();
  };

  const activeDragHandleProps = !editing ? dragHandleProps : undefined;

  return (
    <div className="min-w-[260px] bg-gray-100 p-3 rounded">
      <div className="flex items-center justify-between mb-2">
        {editing ? (
          <div className="flex gap-2 items-center">
            <input value={title} onChange={e => setTitle(e.target.value)} className="border px-2 py-1 rounded" />
            <button
              className="px-2 py-1 bg-green-600 text-white rounded"
              disabled={busy}
              onClick={async () => {
                if (!title.trim()) return;
                setBusy(true);
                try {
                  await dispatch(updateList({ id: list.id, updates: { title } })).unwrap();
                  setEditing(false);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Save
            </button>
            <button className="px-2 py-1 bg-gray-300 rounded" onClick={() => { setEditing(false); setTitle(list.title); }}>Cancel</button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              {activeDragHandleProps ? (
                <button
                  type="button"
                  {...activeDragHandleProps}
                  className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 rounded cursor-grab active:cursor-grabbing"
                  aria-label="Drag to reorder column"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </button>
              ) : (
                <span
                  className="flex items-center rounded"
                  aria-hidden="true"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                  </svg>
                </span>
              )}
              <h3 className="font-semibold">{list.title}</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">{cards.length}</div>
              <button className="text-sm text-blue-600" onClick={() => setEditing(true)}>Edit</button>
              <button
                className="text-sm text-red-600"
                onClick={async () => {
                  if (!confirm('Delete this column?')) return;
                  setBusy(true);
                  try {
                    await dispatch(deleteList(list.id)).unwrap();
                  } finally {
                    setBusy(false);
                  }
                }}
                disabled={busy}
              >
                Delete
              </button>
            </div>
          </>
        )}
      </div>

      <Droppable droppableId={String(list.id)}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-2"
          >
            {cards.map((card, index) => (
              // Cards use 'card-' prefix in draggableId to distinguish them from columns.
              // This prefix is stripped in BoardView's onDragEnd handler to get the actual card ID.
              <Draggable
                key={card.id}
                draggableId={`card-${String(card.id)}`}
                index={index}
                droppableId={String(list.id)}
              >
                {(dragProvided, dragSnapshot) => (
                  <div
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    {...dragProvided.dragHandleProps}
                    data-card-id={card.id}
                    className={dragSnapshot.isDragging ? 'opacity-40' : ''}
                  >
                    <CardItem card={card} onClick={() => {}} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-3">
        {showComposer ? (
          <div className="flex gap-2 items-start">
            <input
              autoFocus
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              className="flex-1 border px-2 py-1 rounded"
              placeholder="Card title"
            />
            <div className="flex gap-2">
              <button type="button" className="px-2 py-1 bg-blue-600 text-white rounded" onClick={submitNewCard} disabled={busy}>{busy ? 'Adding...' : 'Add'}</button>
              <button type="button" className="px-2 py-1 bg-gray-300 rounded" onClick={cancelComposer} disabled={busy}>Cancel</button>
            </div>
          </div>
        ) : (
          <button type="button" className="text-sm text-blue-600" onClick={openComposer} disabled={busy}>
            {busy ? 'Adding...' : '+ Add card'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ListColumn;
