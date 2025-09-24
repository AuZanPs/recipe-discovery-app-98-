import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Recipe Discovery App Error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell">
          <div className="window main-shell">
            <div className="title-bar">
              <div className="title-bar-text">Recipe Discovery - System Error</div>
            </div>
            <div className="window-body" style={{ padding: '32px', textAlign: 'center' }}>
              <div className="error-boundary-content">
                <h2 style={{ margin: '0 0 16px', color: '#cc0000' }}>⚠️ Application Error</h2>
                <p style={{ marginBottom: '24px', fontSize: '12px' }}>
                  The Recipe Discovery application has encountered an unexpected error.
                </p>
                
                <div className="sunken-panel" style={{ 
                  padding: '16px', 
                  marginBottom: '24px', 
                  textAlign: 'left',
                  backgroundColor: '#fff',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                  <strong>Error Details:</strong><br />
                  {this.state.error?.message || 'Unknown error occurred'}
                  {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
                    <details style={{ marginTop: '8px' }}>
                      <summary style={{ cursor: 'pointer' }}>Stack Trace</summary>
                      <pre style={{ whiteSpace: 'pre-wrap', fontSize: '10px', marginTop: '8px' }}>
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button onClick={this.handleRetry} className="retry-button">
                    🔄 Try Again
                  </button>
                  <button onClick={() => window.location.reload()} className="reload-button">
                    🔄 Reload Page
                  </button>
                </div>

                <p style={{ 
                  marginTop: '24px', 
                  fontSize: '10px', 
                  color: '#666',
                  fontStyle: 'italic'
                }}>
                  If this problem persists, please refresh the page or check your internet connection.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
