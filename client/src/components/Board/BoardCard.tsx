import React from 'react';
import { BoardModel } from '../../types';
import './BoardCard.css';

interface BoardCardProps {
  board: BoardModel;
  onClick: (board: BoardModel) => void;
  onDelete?: (id: string) => void;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onClick, onDelete }) => {
  return (
    <div
      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer p-5 flex flex-col gap-2 border border-gray-200 relative"
      onClick={() => onClick(board)}
    >
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-red-600 p-1 rounded focus:outline-none z-10"
        title="Delete board"
        onClick={e => {
          e.stopPropagation();
          onDelete && onDelete(board.id);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
      </button>
      <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">{board.title}</h3>
      {board.description && (
        <p className="text-gray-500 text-sm mb-2 break-words whitespace-pre-line">{board.description}</p>
      )}
      <div className="flex items-center justify-between text-xs text-gray-400 mt-auto pt-2 border-t border-gray-100">
        <span>
          {board.members.length} member{board.members.length !== 1 ? 's' : ''}
        </span>
        <span>
          {new Date(board.createdAt).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};

export default BoardCard;