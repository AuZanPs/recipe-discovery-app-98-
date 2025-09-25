import { useState, useCallback, useMemo, useEffect, memo, lazy, Suspense } from 'react';
import { useRecipes, useRandomRecipe, useCategories, useByCategory, useMultipleRandomRecipes, useRandomRecipeRefresh } from '../hooks';
import { useProgressiveRecipes } from '../hooks/useProgressiveRecipes';
import { processMeal } from '../types';
import { getMealById } from '../api';
import { WindowFrame } from '../components/WindowFrame/WindowFrame';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { RandomRecipeButton } from '../components/RandomRecipeButton/RandomRecipeButton';
import { RecipeGrid } from '../components/RecipeGrid/RecipeGrid';
const RecipeDetailModal = lazy(() =>
  import('../components/RecipeDetailModal/RecipeDetailModal').then(mod => ({ default: mod.RecipeDetailModal }))
);
import { Loading } from '../components/States/Loading';
import { ErrorDialog } from '../components/States/ErrorDialog';
import { EmptyState } from '../components/States/EmptyState';
import { HelpTooltip } from '../components/HelpTooltip';
import { MealPartial, ProcessedMeal } from '../types';

export const Home = memo(() => {
  console.log('HOME COMPONENT: Starting render cycle');
  
  // FIXED STATE MANAGEMENT - No more forced resets
  const [view, setView] = useState<'home' | 'search' | 'category' | 'random' | 'browse'>('home');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedProcessed, setSelectedProcessed] = useState<ProcessedMeal | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // Prevent multiple initializations
  // NEW (Spec): Welcome screen state (session scoped) - appears unless explicitly dismissed with 'true'
  const [showWelcome, setShowWelcome] = useState<boolean>(() => {
    const dismissed = sessionStorage.getItem('welcomeDismissed');
    return dismissed !== 'true'; // CRITICAL: Only hide if exactly 'true'
  });

  // QUERY HOOKS - These remain unchanged
  const searchQuery = useRecipes(search);
  const categories = useCategories();
  const categoryMeals = useByCategory(selectedCategory);
  const randomMeal = useRandomRecipe();
  // UPDATED: Progressive loading for instant home display - shows fallbacks immediately
  const homeRandomRecipes = useProgressiveRecipes(9);
  const randomSectionRecipes = useMultipleRandomRecipes(3);
  const refreshRandomRecipes = useRandomRecipeRefresh();

  // FIXED: Initialize ONCE on mount only - NO problematic dependencies
  useEffect(() => {
    if (!hasInitialized) {
      console.log('INITIALIZATION: Setting up initial home state (once only)');
      setView('home');
      setSearch('');
      setSelectedCategory(undefined);
      setHasInitialized(true);
      
      // Progressive recipes auto-start, no manual refetch needed
      console.log('INITIALIZATION: Progressive recipes will auto-load');
    }
  }, []); // CRITICAL: Empty dependencies - runs only once on mount

  // FIXED: Only handle actual page refresh - NO forced view resets
  useEffect(() => {
    const wasRefreshed = sessionStorage.getItem('recipe-app-needs-home-reset');
    if (wasRefreshed) {
      console.log('PAGE REFRESH: Detected actual page refresh, cleaning up');
      sessionStorage.removeItem('recipe-app-needs-home-reset');
      // Don't force view change here - let natural state work
    }
    
    const handleBeforeUnload = () => {
      sessionStorage.setItem('recipe-app-needs-home-reset', 'true');
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []); // CRITICAL: Empty dependencies

  // REMOVED: All the problematic useEffects that were forcing view resets
  // - No more useEffect with [homeRandomRecipes] dependency
  // - No more useEffect with [view] dependency that forced home
  // - No more popstate handler that forced home
  // - No more view correction logic that prevented navigation

  // Debug logging
  console.log('Home render:', {
    view,
    homeRandomRecipesStatus: {
      isLoading: homeRandomRecipes.isLoading,
      recipeCount: homeRandomRecipes.recipes.length,
      loadingCount: homeRandomRecipes.loadingCount
    }
  });

  // CLEAN EVENT HANDLERS - ensure welcome screen hides on any user action
  const dismissWelcome = useCallback(() => {
    if (showWelcome) {
      console.log('WELCOME: Dismissing welcome screen');
      setShowWelcome(false);
      sessionStorage.setItem('welcomeDismissed', 'true');
    }
  }, [showWelcome]);

  const handleSearch = useCallback((searchTerm: string) => {
    dismissWelcome();
    console.log('NAVIGATION: User searched for', searchTerm);
    setView('search');
    setSearch(searchTerm);
    setSelectedCategory(undefined);
    setSelectedProcessed(null);
  }, [dismissWelcome]);

  const handleCategory = useCallback((cat?: string) => {
    dismissWelcome();
    console.log('NAVIGATION: User selected category', cat);
    if (cat) {
      setView('category');
      setSelectedCategory(cat);
      setSearch('');
      setSelectedProcessed(null);
    } else {
      setView(search ? 'search' : 'home');
      setSelectedCategory(undefined);
    }
  }, [search, dismissWelcome]);

  const handleRandom = useCallback(() => {
    dismissWelcome();
    console.log('NAVIGATION: User requested random meal');
    // Clear any cached random recipes to avoid stale flash
    refreshRandomRecipes();
    setView('random');
    setSelectedProcessed(null);
    setSearch('');
    setSelectedCategory(undefined);
    randomSectionRecipes.refetch();
  }, [randomSectionRecipes, dismissWelcome, refreshRandomRecipes]);

  const handleHome = useCallback(() => {
    dismissWelcome();
    console.log('NAVIGATION: User clicked back to home');
    setView('home');
    setSearch('');
    setSelectedCategory(undefined);
    setSelectedProcessed(null);
    // Progressive recipes auto-refresh, no manual refetch needed
  }, [dismissWelcome]);

  const openMeal = useCallback(async (meal: MealPartial) => {
    if (meal.strInstructions) {
      setSelectedProcessed(processMeal(meal));
      return;
    }
    try {
      setLoadingDetail(true);
      const full = await getMealById(meal.idMeal);
      if (full) setSelectedProcessed(processMeal(full));
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const closeModal = () => setSelectedProcessed(null);

  let content: React.ReactNode = null;

  // NEW: Inline WelcomeScreen component
  const WelcomeScreen = ({ onNavigate }: { onNavigate: (section: 'home' | 'browse' | 'random') => void }) => (
    <div style={{ textAlign: 'center', padding: '40px 20px' }}>
      <div className="window" style={{ display: 'inline-block', maxWidth: '500px', width: '100%' }}>
        <div className="title-bar">
          <div className="title-bar-text">Welcome to Recipe Discovery</div>
        </div>
        <div className="window-body" style={{ padding: '20px' }}>
          <h2 style={{ margin: '0 0 16px', fontSize: '14px' }}>Choose where to start:</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <button onClick={() => onNavigate('home')} style={{ padding: '12px', fontSize: '11px', minHeight: '60px' }}>
              <strong>HOME</strong><br /><small>9 featured recipes</small>
            </button>
            <button onClick={() => onNavigate('browse')} style={{ padding: '12px', fontSize: '11px', minHeight: '60px' }}>
              <strong>CATEGORIES</strong><br /><small>Browse by type</small>
            </button>
            <button onClick={() => onNavigate('random')} style={{ padding: '12px', fontSize: '11px', minHeight: '60px' }}>
              <strong>RANDOM</strong><br /><small>Surprise me</small>
            </button>
            <div style={{ padding: '12px', border: '1px inset #c0c0c0', background: '#f0f0f0', fontSize: '11px', minHeight: '60px' }}>
              <strong>SEARCH</strong><br /><small>Use the search bar above</small>
            </div>
          </div>
          <p style={{ fontSize: '10px', color: '#666', margin: 0 }}>
            You can always use the toolbar buttons to navigate between sections
          </p>
        </div>
      </div>
    </div>
  );
  // Window controls moved above early return so welcome path can reuse
  const windowControls = (
    <>
      <HelpTooltip>
        <button aria-label="Help" title="Help & Information">?</button>
      </HelpTooltip>
      <button aria-label="Close" disabled title="Close (disabled)">X</button>
    </>
  );

  // EARLY RETURN: Welcome screen (shows immediately, dismissed on any action)
  if (showWelcome) {
    console.log('HOME RENDER: Displaying welcome screen (showWelcome = true)');
    return (
      <WindowFrame title="Recipe Discovery" className="main-shell" controls={windowControls}>
        <div className="toolbar">
          <SearchBar onSearch={(q) => { handleSearch(q); dismissWelcome(); }} />
          <CategoryFilter categories={categories.data} value={selectedCategory} onChange={(cat) => { handleCategory(cat); dismissWelcome(); }} />
          <div className="toolbar-buttons" style={{ flexShrink: 0 }}>
            <RandomRecipeButton onClick={() => { handleRandom(); dismissWelcome(); }} active={false} />
            <button onClick={() => { setView('browse'); dismissWelcome(); }} className={view === 'browse' ? 'active' : ''}>Categories</button>
            <button onClick={() => { setView('home'); dismissWelcome(); }} className={view === 'home' ? 'active' : ''}>Home</button>
          </div>
        </div>
        <div className="content-area">
          <WelcomeScreen onNavigate={(section) => { setView(section); dismissWelcome(); }} />
        </div>
      </WindowFrame>
    );
  }

  // Derive a status message for aria-live
  const statusMessage = useMemo(() => {
    if (loadingDetail) return 'Loading recipe details...';
    if (view === 'search') {
      if (searchQuery.isLoading) return 'Searching...';
      if (searchQuery.isError) return 'Search failed.';
      if (search && searchQuery.data) return `${searchQuery.data.length} results.`;
    } else if (view === 'category') {
      if (categoryMeals.isLoading) return `Loading category ${selectedCategory || ''}`.trim();
      if (categoryMeals.isError) return 'Category load failed.';
      if (selectedCategory && categoryMeals.data) return `${categoryMeals.data.length} meals in ${selectedCategory}.`;
    } else if (view === 'random') {
      if (randomMeal.isLoading) return 'Fetching random recipe.';
      if (randomMeal.isError) return 'Random recipe failed.';
      if (randomMeal.data) return 'Random recipe loaded.';
    } else if (view === 'browse') {
      if (categories.isLoading) return 'Loading categories.';
      if (categories.isError) return 'Categories failed to load.';
      if (categories.data) return `${categories.data.length} categories.`;
    } else if (view === 'home') {
      if (homeRandomRecipes.isLoading && homeRandomRecipes.recipes.length === 0) return 'Loading featured recipes...';
      if (homeRandomRecipes.recipes.length > 0) return `${homeRandomRecipes.recipes.length} featured recipes loaded.`;
    }
    return '';
  }, [view, search, searchQuery.isLoading, searchQuery.isError, searchQuery.data, categoryMeals.isLoading, categoryMeals.isError, categoryMeals.data, selectedCategory, randomMeal.isLoading, randomMeal.isError, randomMeal.data, categories.isLoading, categories.isError, categories.data, homeRandomRecipes.isLoading, homeRandomRecipes.recipes]);

  if (view === 'search') {
    if (searchQuery.isLoading) content = <Loading message="Searching recipes..." />;
    else if (searchQuery.isError) content = <ErrorDialog message="Failed to search." onRetry={() => searchQuery.refetch()} />;
    else if (search && searchQuery.data && searchQuery.data.length === 0) content = <EmptyState title="No Results" message={`No recipes found for "${search}".`} />;
    else if (searchQuery.data) content = <RecipeGrid meals={searchQuery.data} onSelect={openMeal} />;
  } else if (view === 'category') {
    if (categoryMeals.isLoading) content = <Loading message={`Loading ${selectedCategory}...`} />;
    else if (categoryMeals.isError) content = <ErrorDialog message="Failed to load category." onRetry={() => categoryMeals.refetch()} />;
    else if (selectedCategory && categoryMeals.data && categoryMeals.data.length === 0) content = <EmptyState title="Empty" message="No meals in this category." />;
    else if (categoryMeals.data) content = <RecipeGrid meals={categoryMeals.data} onSelect={openMeal} />;
  } else if (view === 'random') {
    // Show 3 random recipes in random section
    if (randomSectionRecipes.isLoading) content = <Loading message="Rolling the dice for 3 random recipes..." />;
    else if (randomSectionRecipes.isError) content = <ErrorDialog message="Failed to fetch random recipes." onRetry={handleRandom} />;
    else if (randomSectionRecipes.data && randomSectionRecipes.data.length > 0) {
      content = (
        <div>
          <div style={{ marginBottom: '16px', padding: '8px 0', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>Random Recipe Discovery</h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>3 surprise recipes just for you!</p>
          </div>
          <RecipeGrid meals={randomSectionRecipes.data} onSelect={openMeal} />
        </div>
      );
    }
  } else if (view === 'browse') {
    if (categories.isLoading) content = <Loading message="Loading categories..." />;
    else if (categories.isError) content = <ErrorDialog message="Failed to load categories." onRetry={() => categories.refetch()} />;
    else if (categories.data) {
      content = (
        <div className="categories-browse-grid">
          {categories.data.map(cat => (
            <div key={cat.idCategory} className="window category-card" style={{ cursor: 'pointer' }} onClick={() => handleCategory(cat.strCategory)}>
              <div className="title-bar"><div className="title-bar-text">{cat.strCategory}</div></div>
              <div className="window-body" style={{ padding: 8, textAlign: 'center' }}>
                <img src={cat.strCategoryThumb} alt={cat.strCategory} style={{ width: '100%', height: 80, objectFit: 'cover', border: '2px inset #c0c0c0' }} />
              </div>
            </div>
          ))}
        </div>
      );
    }
  } else {
    // HOME landing view - show featured random recipes with progressive loading
    console.log('HOME view - homeRandomRecipes state:', {
      isLoading: homeRandomRecipes.isLoading,
      recipeCount: homeRandomRecipes.recipes.length,
      loadingCount: homeRandomRecipes.loadingCount
    });

    if (homeRandomRecipes.isLoading && homeRandomRecipes.recipes.length === 0) {
      content = <Loading message="Loading featured recipes..." />;
    } else if (homeRandomRecipes.recipes.length > 0) {
      // Show recipes with loading indicator if still loading more
      content = (
        <div>
          <div style={{ marginBottom: '16px', padding: '8px 0', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>Featured Random Recipes</h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>
              {homeRandomRecipes.isLoading 
                ? `Showing ${homeRandomRecipes.recipes.length} recipes - Loading more...`
                : `${homeRandomRecipes.recipes.length} delicious recipes to get you started - Click any card for details`
              }
            </p>
          </div>
          <RecipeGrid meals={homeRandomRecipes.recipes} onSelect={openMeal} />
        </div>
      );
    } else {
      // Fallback when no recipes available - progressive recipes should always have fallbacks
      content = (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="window" style={{ display: 'inline-block', minWidth: '300px' }}>
            <div className="title-bar">
              <div className="title-bar-text">Welcome to Recipe Discovery</div>
            </div>
            <div className="window-body" style={{ padding: '16px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '11px' }}>
                Start exploring delicious recipes by:
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setView('browse')} style={{ fontSize: '11px' }}>
                  Browse Categories
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // windowControls already declared above (shared with welcome path)

  console.log('RENDER STATE: view =', view, 'search =', search, 'category =', selectedCategory);

  return (
    <WindowFrame title="Recipe Discovery" className="main-shell" controls={windowControls}>
      <div className="toolbar">
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter categories={categories.data} value={selectedCategory} onChange={handleCategory} />
        <div className="toolbar-buttons" style={{ flexShrink: 0 }}>
          <RandomRecipeButton onClick={handleRandom} active={view === 'random'} />
          <button onClick={() => setView('browse')} className={view === 'browse' ? 'active' : ''}>Categories</button>
          <button onClick={handleHome} className={view === 'home' ? 'active' : ''}>Home</button>
        </div>
      </div>
      <div className="content-area">
        <div aria-live="polite" className="sr-only">{statusMessage}</div>
        {content}
        {loadingDetail && <Loading message="Loading recipe details..." />}
      </div>
      {selectedProcessed && !loadingDetail && (
        <Suspense fallback={null}>
          <RecipeDetailModal meal={selectedProcessed} onClose={closeModal} />
        </Suspense>
      )}
    </WindowFrame>
  );
});

Home.displayName = 'Home';