import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { fetchBoards, deleteBoard, setCurrentBoard } from './store/slices/boardsSlice';
import { fetchCurrentUser, logoutUser } from './store/slices/authSlice';
import { BoardCard } from './components/Board';
import { BoardModel } from './types';
import './App.css';
import CreateBoardModal from './components/CreateBoardModal';
import BoardView from './pages/BoardView';
import AuthScreen from './components/AuthScreen';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, loading, error, currentBoard } = useSelector((state: RootState) => state.boards);
  const { isAuthenticated, initialized, user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchBoards());
    }
  }, [dispatch, isAuthenticated]);

  const handleBoardClick = (board: BoardModel) => {
    dispatch(setCurrentBoard(board));
  };


  const [showModal, setShowModal] = useState(false);
  const handleCreateBoard = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const handleDeleteBoard = (id: string) => {
    dispatch(deleteBoard(id));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    dispatch(setCurrentBoard(null));
  };

  if (!initialized) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex items-center justify-between px-6 py-4 bg-white shadow">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management App</h1>
          {user && <p className="text-sm text-gray-500">Signed in as {user.name}</p>}
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors" onClick={handleCreateBoard}>
            Create Board
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {loading && <div className="text-center text-gray-500">Loading boards...</div>}

        {error && <div className="text-center text-red-600">Error: {error}</div>}

        {currentBoard ? (
          <BoardView />
        ) : (
          <>
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
          </>
        )}
      </main>
      {/* Always render the modal at the root, not inside grid/conditionals */}
      {showModal && <CreateBoardModal onClose={handleCloseModal} />}
    </div>
  );
}

export default App;
