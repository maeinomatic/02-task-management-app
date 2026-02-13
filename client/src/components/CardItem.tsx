import React from 'react';
import { CardModel } from '../types';

interface Props {
  card: CardModel;
  onClick: (card: CardModel) => void;
}

const CardItem: React.FC<Props> = ({ card, onClick }) => {
  return (
    <button
      type="button"
      className="w-full text-left bg-white p-2 rounded shadow-sm cursor-pointer"
      onClick={() => onClick(card)}
    >
      <div className="font-medium">{card.title}</div>
      {card.description && <div className="text-sm text-gray-600">{card.description}</div>}
    </button>
  );
};

export default CardItem;
