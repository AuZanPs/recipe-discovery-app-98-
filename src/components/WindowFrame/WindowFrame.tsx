// New JSX transform: no need for React default import
import './windowframe.css';
import type { ReactNode, FC } from 'react';

interface WindowFrameProps {
  title: string;
  children: ReactNode;
  controls?: ReactNode;
  className?: string;
}

export const WindowFrame: FC<WindowFrameProps> = ({ title, children, controls, className }) => {
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
