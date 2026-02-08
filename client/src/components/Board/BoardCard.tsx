import React from 'react';
import { Board } from '../../types';
import './BoardCard.css';

interface BoardCardProps {
  board: Board;
  onClick: (board: Board) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onClick }) => {
  return (
    <div className="board-card" onClick={() => onClick(board)}>
      <h3 className="board-title">{board.title}</h3>
      {board.description && (
        <p className="board-description">{board.description}</p>
      )}
      <div className="board-meta">
        <span className="board-members">
          {board.members.length} member{board.members.length !== 1 ? 's' : ''}
        </span>
        <span className="board-date">
          {new Date(board.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default BoardCard;