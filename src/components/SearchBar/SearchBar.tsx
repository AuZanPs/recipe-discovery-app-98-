import React, { useState, useEffect, useRef } from 'react';

interface Props {
  onSearch: (q: string) => void;
}

export const SearchBar: React.FC<Props> = ({ onSearch }) => {
  const [q, setQ] = useState('');
  const debounceRef = useRef<number>();

  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const trimmed = q.trim();
      if (trimmed.length === 0) onSearch('');
      else if (trimmed.length >= 2) onSearch(trimmed);
    }, 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [q, onSearch]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (trimmed) onSearch(trimmed);
  };

  return (
    <form onSubmit={submit} style={{ flex: 2, minWidth: 220 }}>
      <div className="field-row" style={{ gap: 8 }}>
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search recipes..." style={{ flex: 1 }} />
        <button type="submit" disabled={!q.trim()}>Search</button>
      </div>
    </form>
  );
};
