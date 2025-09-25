Demo: https://auzanps.github.io/recipe-discovery-app-98-/

# Recipe Discovery

Windows 98–styled recipe finder using TheMealDB with fast search, category browsing, detail modal, and inline accessible loading states.

## Features

- Search by name (debounced) using TheMealDB
- Category browse grid + dropdown filter
- Accessible detail modal (focus trap, Esc to close)
- Random recipe trigger
- Inline loading indicators + single aria-live status region
- Lazy detail fetching for partial meals (category/filter results)

## Quick Start

```bash
npm install
npm run dev
```

Production build:
```bash
npm run build
npm run preview
```

## Tech Stack

React • TypeScript • Vite • TanStack Query • 98.css • TheMealDB API

## Accessibility

- One polite `aria-live` region announces search / category / random status
- Esc closes the recipe modal; focus is restored to prior element
- Focus trapped within modal for keyboard users
- Inline role="status" loaders avoid blocking interaction

## Environment

If you need to override defaults, copy `.env.example` to `.env`:

```
VITE_MEALDB_API_KEY=1
# VITE_MEALDB_BASE_URL=https://www.themealdb.com/api/json/v1/1
```

## Project Structure (excerpt)

```
src/
	api/mealdb.ts
	types/recipe.ts
	hooks/ (search, category, detail, random, categories)
	components/
		RecipeCard/
		RecipeGrid/
		RecipeDetailModal/
		CategoryFilter/
		RandomRecipeButton/
		SearchBar/
		States/ (Loading, ErrorDialog, EmptyState)
		WindowFrame/
	pages/Home.tsx
	styles/global.css
```

## Caching Model

Standard keys: `['recipes', query]`, `['byCategory', category]`, `['categories']`, `['recipe', id]`, `['random']`

Timing: `staleTime = 60_000` (except random = 0) and `gcTime = 300_000`.

## Testing

Lightweight smoke tests (Jest + RTL) cover:
- Debounced search input behavior
- Modal accessibility (Escape close) & ingredient list
- Query hook fetch contract (mocked)

Run:
```bash
npm test
```

## Deployment

This app is automatically deployed to GitHub Pages via GitHub Actions on every push to main.

**Live Demo:** https://auzanps.github.io/recipe-discovery-app-98-/

### Manual Deployment
You can also deploy manually using:
```bash
npm run deploy
```

Focused on clarity, accessibility, and a nostalgic aesthetic without unnecessary complexity.
