import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { Landing } from './pages/Landing';
import { HelmetProvider } from 'react-helmet-async';

const rawPath = window.location.pathname;
const base = (import.meta as any).env.BASE_URL || '/';

// Support GitHub Pages 404.html redirect: /?redirect=<path>
const params = new URLSearchParams(window.location.search);
const redirect = params.get('redirect');
if (redirect) {
  const target = redirect === 'app' || redirect === '/app' ? '/app' : '/' + redirect.replace(/^\/+/, '');
  // Update URL to the intended client-side path under base without reload
  const newUrl = (base.endsWith('/') ? base.slice(0, -1) : base) + target;
  try { window.history.replaceState(null, '', newUrl); } catch {}
}
// Remove the base prefix from pathname for local matching
const path = rawPath.startsWith(base) ? rawPath.slice(base.length - (base.endsWith('/') ? 1 : 0)) : rawPath;
// Normalize: ensure path starts with '/'
const norm = path.startsWith('/') ? path : '/' + path;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      {norm === '/app' ? <App /> : <Landing />}
    </HelmetProvider>
  </StrictMode>
);

// Register a simple service worker for caching static assets and API responses
if ('serviceWorker' in navigator) {
  const base = (import.meta as any).env.BASE_URL || '/';
  const swPath = (base.endsWith('/') ? base : base + '/') + 'sw.js';
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(swPath).catch(() => {});
  });
}