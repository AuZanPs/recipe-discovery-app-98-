import { useState, useRef, useEffect } from 'react';
import './HelpTooltip.css';

interface HelpTooltipProps {
  children: React.ReactNode;
}

export const HelpTooltip = ({ children }: HelpTooltipProps) => {
  const [show, setShow] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = (e: React.MouseEvent) => {
    clearTimeout(timeoutRef.current);
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setShow(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setShow(false);
    }, 100); // Small delay for better UX
  };

  const handleTooltipMouseEnter = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleTooltipMouseLeave = () => {
    setShow(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ position: 'relative' }}
      >
        {children}
      </span>
      
      {show && (
        <div
          className="help-tooltip-popup"
          style={{
            position: 'fixed',
            left: position.x,
            top: position.y,
            zIndex: 10000
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <div className="window help-tooltip-window">
            <div className="title-bar">
              <div className="title-bar-text">Recipe Discovery</div>
            </div>
            <div className="window-body">
              <div className="help-content">
                <p><strong>Recipe Discovery App</strong></p>
                <p>Windows 98-style recipe finder</p>
                <hr />
                <p><strong>Features:</strong></p>
                <ul>
                  <li>Search recipes by name</li>
                  <li>Browse by categories</li>
                  <li>Discover random recipes</li>
                  <li>View detailed instructions</li>
                </ul>
                <hr />
                <p><strong>Usage:</strong></p>
                <p>Click any recipe card for full details and cooking instructions.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};