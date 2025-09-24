import { useEffect, useRef } from 'react';
import './HelpModal.css';

interface HelpTooltipProps {
  x: number;
  y: number;
  onClose: () => void;
}

export const HelpModal = ({ x, y, onClose }: HelpTooltipProps) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Focus management and escape key handling
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    // Handle click outside
    const handleClickOutside = (e: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div 
      className="help-tooltip"
      ref={tooltipRef}
      style={{ 
        position: 'fixed', 
        left: x + 10, 
        top: y - 10,
        zIndex: 9999 
      }}
    >
      <div className="window help-tooltip-window">
        <div className="title-bar">
          <div className="title-bar-text">Recipe Discovery Help</div>
          <div className="title-bar-controls">
            <button onClick={onClose} className="help-close-button">✕</button>
          </div>
        </div>
        <div className="window-body" style={{ padding: '8px', fontSize: '11px' }}>
          <p style={{ margin: '0 0 8px', fontWeight: 'bold' }}>Recipe Discovery</p>
          <p style={{ margin: '0 0 6px' }}>Find delicious recipes with ease</p>
          <p style={{ margin: '0 0 6px' }}>• Search by name or browse categories</p>
          <p style={{ margin: '0 0 6px' }}>• Discover random recipes</p>
          <p style={{ margin: '0' }}>• Click any recipe card for details</p>
        </div>
      </div>
    </div>
  );
};