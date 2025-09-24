
interface Props { message: string; onRetry?: () => void; }
export const ErrorDialog = ({ message, onRetry }: Props) => (
  <div className="error-container">
    <div className="window error-window">
      <div className="title-bar"><div className="title-bar-text">Error</div></div>
      <div className="window-body" style={{ padding: 16 }}>
        <p style={{ fontWeight: 'bold', marginTop: 0 }}>Something went wrong</p>
        <p style={{ marginBottom: 16 }}>{message}</p>
        {onRetry && <button onClick={onRetry}>Try Again</button>}
      </div>
    </div>
  </div>
);
