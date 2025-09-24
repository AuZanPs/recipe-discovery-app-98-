import React, { useEffect, useRef } from 'react';
import { ProcessedMeal } from '../../types/recipe';

interface Props {
  meal: ProcessedMeal;
  onClose: () => void;
}

export const RecipeDetailModal: React.FC<Props> = ({ meal, onClose }) => {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const lastFocused = useRef<HTMLElement | null>(document.activeElement as HTMLElement);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'Tab') {
        if (!dialogRef.current) return;
        const focusables = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], select, input, [tabindex]:not([tabindex="-1"])');
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKey);
    setTimeout(() => {
      const firstBtn = dialogRef.current?.querySelector<HTMLElement>('button, [href], [tabindex]');
      firstBtn?.focus();
    }, 0);
    return () => {
      document.removeEventListener('keydown', handleKey);
      lastFocused.current?.focus();
    };
  }, [onClose]);

  return (
    <div className="recipe-detail-overlay" onClick={onClose}>
      <div ref={dialogRef} className="window recipe-detail" role="dialog" aria-modal="true" aria-label={meal.name} onClick={e => e.stopPropagation()}>
        <div className="title-bar">
          <div className="title-bar-text">{meal.name}</div>
          <div className="title-bar-controls">
            <button aria-label="Close" onClick={onClose}></button>
          </div>
        </div>
        <div className="window-body recipe-content">
          <div className="recipe-header">
            <img src={meal.thumbnail} alt={meal.name} className="recipe-image" />
            <div className="recipe-meta">
              <div className="field-row"><label>Category:</label><span>{meal.category || 'Uncategorized'}</span></div>
              <div className="field-row"><label>Area:</label><span>{meal.area || 'Global'}</span></div>
              {meal.tags.length > 0 && (<div className="field-row"><label>Tags:</label><span>{meal.tags.join(', ')}</span></div>)}
              {meal.youtube && (<button onClick={() => window.open(meal.youtube!, '_blank')}>Video</button>)}
              {meal.source && (<button onClick={() => window.open(meal.source!, '_blank')}>Source</button>)}
            </div>
          </div>
          <div className="recipe-sections">
            <div className="ingredients-section">
              <h3>Ingredients</h3>
              <div className="sunken-panel ingredients-list">
                {meal.ingredients.map((i, idx) => (
                  <div key={idx} className="ingredient-item">
                    <span className="ingredient-measure">{i.measure}</span>
                    <span className="ingredient-name">{i.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="instructions-section">
              <h3>Instructions</h3>
              <div className="sunken-panel instructions-text">
                {meal.instructions.split('\n').map((line, idx) => (
                  <p key={idx} style={{ marginBottom: line.trim() ? 8 : 4 }}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
