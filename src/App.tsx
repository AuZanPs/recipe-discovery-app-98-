import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Home } from './pages/Home';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './styles/global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 1000 * 60 * 5, // 5 minutes default
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <div className="app-shell">
        <Home />
      </div>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;