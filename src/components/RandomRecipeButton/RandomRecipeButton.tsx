
interface Props { onClick: () => void; active?: boolean; }

export const RandomRecipeButton = ({ onClick, active }: Props) => (
  <button onClick={onClick} className={active ? 'active' : ''}>
    Random
  </button>
);
