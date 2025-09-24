
interface Props { title: string; message: string; actionLabel?: string; onAction?: () => void; }
export const EmptyState = ({ title, message, actionLabel, onAction }: Props) => (
  <div className="empty-state">
    <div className="window empty-state-window">
      <div className="title-bar"><div className="title-bar-text">{title}</div></div>
      <div className="window-body" style={{ textAlign: 'center', padding: 32 }}>
        <p style={{ fontWeight: 'bold', margin: '0 0 16px' }}>{message}</p>
        {actionLabel && onAction && <button onClick={onAction}>{actionLabel}</button>}
      </div>
    </div>
  </div>
);
