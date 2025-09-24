import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRecipes, useRandomRecipe, useCategories, useByCategory, useMultipleRandomRecipes } from '../hooks';
import { processMeal } from '../types';
import { getMealById } from '../api';
import { WindowFrame } from '../components/WindowFrame/WindowFrame';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { RandomRecipeButton } from '../components/RandomRecipeButton/RandomRecipeButton';
import { RecipeGrid } from '../components/RecipeGrid/RecipeGrid';
import { RecipeDetailModal } from '../components/RecipeDetailModal/RecipeDetailModal';
import { Loading } from '../components/States/Loading';
import { ErrorDialog } from '../components/States/ErrorDialog';
import { EmptyState } from '../components/States/EmptyState';
import { HelpModal } from '../components/HelpModal';
import { MealPartial, ProcessedMeal } from '../types';

export const Home = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedProcessed, setSelectedProcessed] = useState<ProcessedMeal | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [view, setView] = useState<'default' | 'search' | 'category' | 'random' | 'browse'>('default');
  const [showHelp, setShowHelp] = useState(false);
  const [helpTooltipPos, setHelpTooltipPos] = useState({ x: 0, y: 0 });

  const searchQuery = useRecipes(search);
  const categories = useCategories();
  const categoryMeals = useByCategory(selectedCategory);
  const randomMeal = useRandomRecipe();
  const homeRandomRecipes = useMultipleRandomRecipes(6); // 6 for home page
  const randomSectionRecipes = useMultipleRandomRecipes(3); // 3 for random section

  // **FIX 1: Ensure default view loads immediately with data**
  useEffect(() => {
    console.log('Home component mounted - setting up default view');
    
    // Always start in default view
    setView('default');
    
    // Force immediate fetch if no data exists
    if (!homeRandomRecipes.data && !homeRandomRecipes.isLoading && !homeRandomRecipes.isError) {
      console.log('No home data found, triggering immediate fetch...');
      homeRandomRecipes.refetch();
    }
  }, []); // Empty dependency array to run only once on mount

  // **FIX 1: Add debugging to track view state changes**
  useEffect(() => {
    console.log('View changed to:', view);
    console.log('Home recipes status:', {
      isLoading: homeRandomRecipes.isLoading,
      hasData: !!homeRandomRecipes.data,
      dataLength: homeRandomRecipes.data?.length,
      isError: homeRandomRecipes.isError
    });
  }, [view, homeRandomRecipes.isLoading, homeRandomRecipes.data, homeRandomRecipes.isError]);

  // Debug logging
  console.log('Home render:', {
    view,
    homeRandomRecipesStatus: {
      isLoading: homeRandomRecipes.isLoading,
      isError: homeRandomRecipes.isError,
      dataLength: homeRandomRecipes.data?.length,
      error: homeRandomRecipes.error
    }
  });

  const handleSearch = useCallback((q: string) => {
    setSearch(q);
    setView('search');
  }, []);

  const handleCategory = useCallback((cat?: string) => {
    setSelectedCategory(cat);
    if (cat) setView('category'); else setView(search ? 'search' : 'default');
  }, [search]);

  const handleRandom = useCallback(() => {
    console.log('Random recipe requested');
    setView('random');
    randomSectionRecipes.refetch(); // Use randomSectionRecipes for random section
  }, [randomSectionRecipes]);

  const handleHome = useCallback(() => {
    console.log('Home button clicked - resetting to default view');
    setSearch('');
    setSelectedCategory(undefined);
    setView('default');
    // Refresh home recipes when explicitly going home
    homeRandomRecipes.refetch();
  }, [homeRandomRecipes]);

  const handleHelp = useCallback((e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHelpTooltipPos({ 
      x: rect.left + rect.width / 2, 
      y: rect.bottom + 5 
    });
    setShowHelp(true);
  }, []);

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
  const closeHelp = () => setShowHelp(false);

  let content: React.ReactNode = null;

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
    } else if (view === 'default') {
      if (homeRandomRecipes.isLoading) return 'Loading featured recipes...';
      if (homeRandomRecipes.isError) return 'Failed to load featured recipes.';
      if (homeRandomRecipes.data) return `${homeRandomRecipes.data.length} featured recipes loaded.`;
    }
    return '';
  }, [view, search, searchQuery.isLoading, searchQuery.isError, searchQuery.data, categoryMeals.isLoading, categoryMeals.isError, categoryMeals.data, selectedCategory, randomMeal.isLoading, randomMeal.isError, randomMeal.data, categories.isLoading, categories.isError, categories.data, homeRandomRecipes.isLoading, homeRandomRecipes.isError, homeRandomRecipes.data]);

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
    // default landing view - show 6 featured random recipes
    console.log('Default view - homeRandomRecipes state:', {
      isLoading: homeRandomRecipes.isLoading,
      isError: homeRandomRecipes.isError,
      data: homeRandomRecipes.data,
      dataLength: homeRandomRecipes.data?.length
    });

    if (homeRandomRecipes.isLoading) {
      console.log('Showing loading state');
      content = <Loading message="Loading featured recipes..." />;
    } else if (homeRandomRecipes.isError) {
      console.log('Showing error state with fallback option');
      content = (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="window" style={{ display: 'inline-block', minWidth: '300px' }}>
            <div className="title-bar">
              <div className="title-bar-text">Unable to Load Featured Recipes</div>
            </div>
            <div className="window-body" style={{ padding: '16px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '11px' }}>
                The recipe service is temporarily unavailable. You can still:
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setView('browse')} style={{ fontSize: '11px' }}>
                  Browse Categories
                </button>
                <button onClick={() => homeRandomRecipes.refetch()} style={{ fontSize: '11px' }}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (homeRandomRecipes.data && homeRandomRecipes.data.length > 0) {
      console.log('Showing recipes:', homeRandomRecipes.data.length);
      content = (
        <div>
          <div style={{ marginBottom: '16px', padding: '8px 0', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>Featured Random Recipes</h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>6 delicious recipes to get you started - Click any card for details</p>
          </div>
          <RecipeGrid meals={homeRandomRecipes.data} onSelect={openMeal} />
        </div>
      );
    } else {
      // Fallback when no error but also no data
      console.log('No data available - showing fallback options');
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
                <button onClick={handleRandom} style={{ fontSize: '11px' }}>
                  Get Random Recipe
                </button>
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

  // Window controls with help button (98.css pattern)
  const windowControls = (
    <>
      <button aria-label="Help" onClick={handleHelp} title="Help & Information">?</button>
      <button aria-label="Close" disabled title="Close (disabled)">✕</button>
    </>
  );

  return (
    <WindowFrame title="Recipe Discovery" className="main-shell" controls={windowControls}>
      <div className="toolbar">
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter categories={categories.data} value={selectedCategory} onChange={handleCategory} />
        <div className="toolbar-buttons" style={{ flexShrink: 0 }}>
          <RandomRecipeButton onClick={handleRandom} active={view === 'random'} />
          <button onClick={() => setView('browse')} className={view === 'browse' ? 'active' : ''}>Categories</button>
          <button onClick={handleHome} className={view === 'default' ? 'active' : ''}>Home</button>
        </div>
      </div>
      <div className="content-area">
        <div aria-live="polite" className="sr-only">{statusMessage}</div>
        {content}
        {loadingDetail && <Loading message="Loading recipe details..." />}
      </div>
      {selectedProcessed && !loadingDetail && (
        <RecipeDetailModal meal={selectedProcessed} onClose={closeModal} />
      )}
      {showHelp && <HelpModal x={helpTooltipPos.x} y={helpTooltipPos.y} onClose={closeHelp} />}
    </WindowFrame>
  );
};