import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { fetchBoards, deleteBoard } from './store/slices/boardsSlice';
import { BoardCard } from './components/Board';
import { BoardModel } from './types';
import './App.css';
import CreateBoardModal from './components/CreateBoardModal';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, loading, error } = useSelector((state: RootState) => state.boards);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleBoardClick = (board: BoardModel) => {
    console.log('Selected board:', board);
    // TODO: Navigate to board view
  };


  const [showModal, setShowModal] = useState(false);
  const handleCreateBoard = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleDeleteBoard = (id: string) => {
    dispatch(deleteBoard(id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <h1 className="text-2xl font-bold text-gray-900">Task Management App</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" onClick={handleCreateBoard}>
          Create Board
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading && <div className="text-center text-gray-500">Loading boards...</div>}

        {error && <div className="text-center text-red-600">Error: {error}</div>}

        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-6">
            {boards.length === 0 ? (
              <div className="col-span-full text-center bg-white p-8 rounded shadow">
                <h2 className="text-lg font-semibold mb-2">No boards yet</h2>
                <p className="mb-4 text-gray-500">Create your first board to get started!</p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" onClick={handleCreateBoard}>
                  Create Board
                </button>
              </div>
            ) : (
              boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onClick={handleBoardClick}
                  onDelete={handleDeleteBoard}
                />
              ))
            )}
          </div>
        )}
      </main>
      {/* Always render the modal at the root, not inside grid/conditionals */}
      {showModal && <CreateBoardModal onClose={handleCloseModal} />}
    </div>
  );
}

export default App;
