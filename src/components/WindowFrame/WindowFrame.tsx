import React from 'react';
import './windowframe.css';

interface WindowFrameProps {
  title: string;
  children: React.ReactNode;
  controls?: React.ReactNode;
  className?: string;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({ title, children, controls, className }) => {
  return (
    <div className={`window ${className || ''}`.trim()}>
      <div className="title-bar">
        <div className="title-bar-text">{title}</div>
        <div className="title-bar-controls">
          {controls}
        </div>
      </div>
      <div className="window-body">
        {children}
      </div>
    </div>
  );
};
