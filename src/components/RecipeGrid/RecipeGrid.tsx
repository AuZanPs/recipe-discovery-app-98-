import { memo } from 'react';
import { MealPartial } from '../../types/recipe';
import { RecipeCard } from '../RecipeCard/RecipeCard';

interface Props {
  meals: MealPartial[];
  onSelect: (meal: MealPartial) => void;
}

export const RecipeGrid = memo(({ meals, onSelect }: Props) => {
  return (
    <div className="meals-grid">
      {meals.map(m => (
        <RecipeCard key={m.idMeal} meal={m} onSelect={onSelect} />
      ))}
    </div>
  );
});

RecipeGrid.displayName = 'RecipeGrid';
