import React from 'react';
import { CardModel } from '../types';

interface Props {
  card: CardModel;
  onClick: (card: CardModel) => void;
}

const CardItem: React.FC<Props> = ({ card, onClick }) => {
  return (
    <div className="bg-white p-2 rounded shadow-sm cursor-pointer" onClick={() => onClick(card)}>
      <div className="font-medium">{card.title}</div>
      {card.description && <div className="text-sm text-gray-600">{card.description}</div>}
    </div>
  );
};

export default CardItem;
