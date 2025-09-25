import { memo } from 'react';
import type { MealPartial } from '../../types/recipe';
import { formatCategoryArea } from '../../utils/metadata';

interface Props {
  meal: MealPartial;
  onSelect: (meal: MealPartial) => void;
}

export const RecipeCard = memo(({ meal, onSelect }: Props) => {
  const cat = meal.strCategory?.trim() || '';
  const area = meal.strArea?.trim() || '';

  let meta: React.ReactNode = null;
  if (cat && area) meta = <p className="meal-meta-line">{formatCategoryArea(cat, area)}</p>;
  else if (cat && !area) meta = <p className="meal-meta-line">{cat} | Global</p>;
  else if (!cat && area) meta = <p className="meal-meta-line">Uncategorized | {area}</p>;

  return (
    <div
      className="window meal-card"
      onClick={() => onSelect(meal)}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
      aria-label={`View ${meal.strMeal} recipe details`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(meal);
        }
      }}
    >
      <div className="title-bar">
        <div className="title-bar-text">{meal.strMeal}</div>
      </div>
      <div className="window-body meal-card-body">
        <div className="meal-card-main">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="meal-thumb"
            loading="lazy"
          />
          <div className="meal-text">
            {meta}
            <p className="meal-hint">Click to view full recipe</p>
          </div>
        </div>
      </div>
    </div>
  );
});

RecipeCard.displayName = 'RecipeCard';
