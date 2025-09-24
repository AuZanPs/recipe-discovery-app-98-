import React from 'react';

interface Props { onClick: () => void; active?: boolean; }

export const RandomRecipeButton: React.FC<Props> = ({ onClick, active }) => (
  <button onClick={onClick} className={active ? 'active' : ''}>
    Random
  </button>
);
