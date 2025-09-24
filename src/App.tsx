import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import './styles/global.css';

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <div className="app-shell">
      <Home />
    </div>
  </QueryClientProvider>
);

export default App;