import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { fetchBoards } from './store/slices/boardsSlice';
import { BoardCard } from './components/Board';
import { Board } from './types';
import './App.css';

function App() {
  const dispatch = useDispatch<AppDispatch>();
  const { boards, loading, error } = useSelector((state: RootState) => state.boards);

  useEffect(() => {
    dispatch(fetchBoards());
  }, [dispatch]);

  const handleBoardClick = (board: Board) => {
    console.log('Selected board:', board);
    // TODO: Navigate to board view
  };

  const handleCreateBoard = () => {
    console.log('Create new board');
    // TODO: Open create board modal
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>Task Management App</h1>
        <button className="create-board-btn" onClick={handleCreateBoard}>
          Create Board
        </button>
      </header>

      <main className="app-main">
        {loading && <div className="loading">Loading boards...</div>}

        {error && <div className="error">Error: {error}</div>}

        {!loading && !error && (
          <div className="boards-grid">
            {boards.length === 0 ? (
              <div className="empty-state">
                <h2>No boards yet</h2>
                <p>Create your first board to get started!</p>
                <button className="create-board-btn" onClick={handleCreateBoard}>
                  Create Board
                </button>
              </div>
            ) : (
              boards.map((board) => (
                <BoardCard
                  key={board.id}
                  board={board}
                  onClick={handleBoardClick}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
