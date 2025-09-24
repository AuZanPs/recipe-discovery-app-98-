import React, { useState, useId } from 'react';
import { MealPartial } from '../../types/recipe';
import { formatCategoryArea } from '../../utils/metadata';

interface Props {
  meal: MealPartial;
  onSelect: (meal: MealPartial) => void;
}

export const RecipeCard: React.FC<Props> = ({ meal, onSelect }) => {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(x => !x);
  };

  const cat = meal.strCategory?.trim() || '';
  const area = meal.strArea?.trim() || '';

  let meta: React.ReactNode = null;
  if (cat && area) meta = <p className="meal-meta-line">{formatCategoryArea(cat, area)}</p>;
  else if (cat && !area) meta = <p className="meal-meta-line">{cat} | Global</p>;
  else if (!cat && area) meta = <p className="meal-meta-line">Uncategorized | {area}</p>;

  return (
    <div
      className={`window meal-card ${expanded ? 'expanded' : 'collapsed'}`}
      onClick={() => onSelect(meal)}
      style={{ cursor: 'pointer' }}
      role="group"
      aria-label={meal.strMeal}
    >
      <div className="title-bar">
        <div className="title-bar-text">{meal.strMeal}</div>
        <div className="title-bar-controls">
          <button
            type="button"
            aria-label={expanded ? 'Collapse card section' : 'Expand card section'}
            aria-expanded={expanded}
            aria-controls={panelId}
            className="meal-card-toggle"
            onClick={toggle}
          >
            {expanded ? '-' : '+'}
          </button>
        </div>
      </div>
      <div className="window-body meal-card-body">
        <div className="meal-card-main">
          <img
            src={meal.strMealThumb}
            alt={meal.strMeal}
            className="meal-thumb"
          />
          <div className="meal-text">
            {meta}
            {meal.strInstructions && (
              <p className={`meal-instructions ${expanded ? 'expanded' : ''}`}>
                {expanded ? meal.strInstructions : `${meal.strInstructions.substring(0, 150)}...`}
              </p>
            )}
          </div>
        </div>
        <div
          id={panelId}
          className="meal-card-extra"
          hidden={!expanded}
          aria-hidden={!expanded}
        >
          {expanded && (
            <div>
              <p style={{ margin: '4px 0 0', fontSize: 11 }}>Click anywhere on the card (outside the +/- button) for full details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
