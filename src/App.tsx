import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { Home } from './pages/Home';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './styles/global.css';
import { getCategories } from './api';
import { FALLBACK_CATEGORIES } from './utils/fallbackRecipes';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // aggressive caching
      staleTime: 15 * 60 * 1000,
      gcTime: 60 * 60 * 1000,
      // smart refetching
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      // fast failures
      retry: 1,
      retryDelay: 200,
      refetchInterval: false,
    },
  },
});

// Preload key data in background
async function preloadData() {
  try {
    await queryClient.prefetchQuery({
      queryKey: ['categories'],
      queryFn: async () => {
        try {
          const categories = await getCategories();
          return categories.length > 0 ? categories : FALLBACK_CATEGORIES;
        } catch {
          return FALLBACK_CATEGORIES;
        }
      },
      staleTime: 60 * 60 * 1000,
    });
    // Removed parallel prefetch to avoid overwhelming API on startup
  } catch (e) {
    // best-effort; ignore
  }
}

const App = () => {
  useEffect(() => {
    preloadData();
  }, []);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <div className="app-shell">
          <Home />
        </div>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;