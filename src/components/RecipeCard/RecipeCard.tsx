import React from 'react';
import { MealPartial } from '../../types/recipe';
import { formatCategoryArea } from '../../utils/metadata';

interface Props {
  meal: MealPartial;
  onSelect: (meal: MealPartial) => void;
}

export const RecipeCard: React.FC<Props> = ({ meal, onSelect }) => {
  return (
    <div className="window meal-card" onClick={() => onSelect(meal)} style={{ cursor: 'pointer' }}>
      <div className="title-bar">
        <div className="title-bar-text">{meal.strMeal}</div>
      </div>
      <div className="window-body" style={{ padding: 8 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: 80, height: 80, objectFit: 'cover', border: '2px inset #c0c0c0' }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            {(() => {
              const cat = meal.strCategory?.trim() || '';
              const area = meal.strArea?.trim() || '';
              if (!cat && !area) return null;
              if (cat && area) {
                return (
                  <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 12 }}>{formatCategoryArea(cat, area)}</p>
                );
              }
              // Exactly one present: apply required fallback for the missing one.
              if (cat && !area) {
                return (
                  <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 12 }}>{cat} | Global</p>
                );
              }
              if (!cat && area) {
                return (
                  <p style={{ margin: '0 0 4px', fontWeight: 'bold', fontSize: 12 }}>Uncategorized | {area}</p>
                );
              }
              return null;
            })()}
            {meal.strInstructions && (
              <p style={{ margin: 0, fontSize: 11, color: '#666', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {meal.strInstructions.substring(0, 150)}...
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
