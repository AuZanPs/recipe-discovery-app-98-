import React from 'react';

// Inline Windows 98–style loading indicator (non-blocking)
export const Loading: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="loading-inline" role="status">
    <div className="progress-bar" aria-hidden="true">
      <div className="progress-bar-fill" />
    </div>
    <span>{message}</span>
  </div>
);
