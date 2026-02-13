import React, { useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setCurrentBoard } from '../store/slices/boardsSlice';
import { fetchLists } from '../store/slices/listsSlice';
import { fetchCards, moveCard, updateCard } from '../store/slices/cardsSlice';
import ListColumn from '../components/ListColumn';
import AddListForm from '../components/AddListForm';
import { DragDropContext, DropResult } from '../dnd';

const BoardView: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const currentBoard = useSelector((s: RootState) => s.boards.currentBoard);
  const lists = useSelector((s: RootState) => s.lists.lists);
  const cardsAll = useSelector((s: RootState) => s.cards.cards);
  const fetchedListIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchedListIdsRef.current.clear();
    if (currentBoard) dispatch(fetchLists(currentBoard.id));
  }, [currentBoard, dispatch]);

  useEffect(() => {
    const activeListIds = new Set(lists.map(list => String(list.id)));
    fetchedListIdsRef.current.forEach((listId) => {
      if (!activeListIds.has(listId)) {
        fetchedListIdsRef.current.delete(listId);
      }
    });

    lists.forEach((list) => {
      const listId = String(list.id);
      if (fetchedListIdsRef.current.has(listId)) return;
      fetchedListIdsRef.current.add(listId);
      dispatch(fetchCards(listId));
    });
  }, [lists, dispatch]);

  const cardsByList = useMemo(() => {
    const map: Record<string, any[]> = {};
    lists.forEach(list => {
      const key = String(list.id);
      map[key] = cardsAll
        .filter(c => String(c.listId) === key)
        .slice()
        .sort((a, b) => a.position - b.position);
    });
    return map;
  }, [cardsAll, lists]);

  const onDragEnd = async (result: DropResult) => {
    const { draggableId, source, destination } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    dispatch(moveCard({
      cardId: draggableId,
      destinationListId: destination.droppableId,
      newPosition: destination.index,
    }));

    const sourceListId = source.droppableId;
    const destListId = destination.droppableId;

    const sourceCards = (cardsByList[sourceListId] ?? []).map(c => String(c.id));
    const destCards = sourceListId === destListId
      ? sourceCards.slice()
      : (cardsByList[destListId] ?? []).map(c => String(c.id));

    const sourceWithout = sourceCards.filter(id => id !== String(draggableId));
    const destinationBase = sourceListId === destListId
      ? sourceWithout.slice()
      : destCards.filter(id => id !== String(draggableId));

    const insertIndex = Math.max(0, Math.min(destination.index, destinationBase.length));
    destinationBase.splice(insertIndex, 0, String(draggableId));

    const updates: Array<{ id: string; listId: string; position: number }> = [];

    if (sourceListId !== destListId) {
      sourceWithout.forEach((id, index) => {
        updates.push({ id, listId: sourceListId, position: index });
      });
    }

    destinationBase.forEach((id, index) => {
      updates.push({ id, listId: destListId, position: index });
    });

    const originalById = new Map(cardsAll.map(c => [String(c.id), c]));
    const changed = updates.filter(update => {
      const original = originalById.get(String(update.id));
      if (!original) return true;
      return String(original.listId) !== String(update.listId) || Number(original.position) !== Number(update.position);
    });

    try {
      await Promise.all(
        changed.map((update) => {
          const listIdPayload: any = isNaN(Number(update.listId)) ? update.listId : Number(update.listId);
          return dispatch(updateCard({
            id: update.id,
            updates: { listId: listIdPayload, position: update.position },
          })).unwrap();
        }),
      );
    } catch {
      dispatch(fetchCards(sourceListId));
      if (destListId !== sourceListId) dispatch(fetchCards(destListId));
    }
  };

  if (!currentBoard) return null;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div>
        <header className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold">{currentBoard.title}</h2>
            {currentBoard.description && <p className="text-sm text-gray-600">{currentBoard.description}</p>}
          </div>
          <div>
            <button className="px-3 py-1 border rounded" onClick={() => dispatch(setCurrentBoard(null))}>Back</button>
          </div>
        </header>

        <section className="flex gap-4 overflow-x-auto">
          <div className="min-w-[260px] bg-white p-3 rounded shadow">
            <h4 className="font-semibold mb-2">Add column</h4>
            <AddListForm boardId={currentBoard.id} />
          </div>

          {lists.length === 0 ? (
            <div className="text-gray-500">No columns yet</div>
          ) : (
            lists.map(list => (
              <ListColumn
                key={list.id}
                list={list}
                cards={cardsByList[String(list.id)] ?? []}
              />
            ))
          )}
        </section>
      </div>
    </DragDropContext>
  );
};

export default BoardView;
