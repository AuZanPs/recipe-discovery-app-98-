import React, { useEffect, useState } from 'react';

export const Landing: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  // If the user has already dismissed the welcome in this session,
  // go straight to the app (home) on reload/visit of the landing page
  useEffect(() => {
    const dismissed = sessionStorage.getItem('welcomeDismissed');
    if (dismissed === 'true') {
      const base = import.meta.env.BASE_URL || '/';
      const target = (base.endsWith('/') ? base : base + '/') + 'app';
      window.location.replace(target);
    }
  }, []);

  const enterApp = () => {
    setIsLoading(true);
    setTimeout(() => {
      sessionStorage.setItem('welcomeDismissed', 'true');
      const base = import.meta.env.BASE_URL || '/';
      // Ensure exactly one slash between base and app
      const target = (base.endsWith('/') ? base : base + '/') + 'app';
      window.location.href = target;
    }, 800);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#008080',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        fontFamily: '"MS Sans Serif", Arial, sans-serif',
      }}
    >
      <div className="window" style={{ width: '500px', maxWidth: '90vw', boxShadow: '6px 6px 0 rgba(0,0,0,0.5)' }}>
        <div className="title-bar">
          <div className="title-bar-text">Recipe Discovery v1.0</div>
          <div className="title-bar-controls">
            <button aria-label="Close" disabled>×</button>
          </div>
        </div>
        <div className="window-body" style={{ padding: '30px', textAlign: 'center' }}>
          {!isLoading ? (
            <>
              <h1 style={{ margin: '0 0 12px', fontSize: 18 }}>Welcome to Recipe Discovery!</h1>
              <p style={{ margin: '0 0 16px', lineHeight: 1.4 }}>
                Discover delicious recipes with our<br />
                Windows 98-style interface
              </p>
              <button style={{ fontSize: 12, padding: '8px 12px' }} onClick={enterApp}>Click This Button for Recipes!</button>
              <p style={{ marginTop: 16 }}><small>Recipe Discovery v1.0 - TheMealDB API</small></p>
            </>
          ) : (
            <div>
              <p style={{ margin: '0 0 12px' }}>Loading Recipe Discovery...</p>
              <div style={{ height: 20, border: '2px inset #c0c0c0', background: '#fff' }}>
                <div style={{ height: '100%', width: '100%', background: 'repeating-linear-gradient(45deg, #316AC5, #316AC5 8px, #1e4f99 8px, #1e4f99 16px)' }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
