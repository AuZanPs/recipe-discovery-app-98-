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
import { MealPartial, ProcessedMeal } from '../types';

export const Home = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedProcessed, setSelectedProcessed] = useState<ProcessedMeal | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [view, setView] = useState<'default' | 'search' | 'category' | 'random' | 'browse'>('default');

  const searchQuery = useRecipes(search);
  const categories = useCategories();
  const categoryMeals = useByCategory(selectedCategory);
  const randomMeal = useRandomRecipe();
  const multipleRandomRecipes = useMultipleRandomRecipes(4); // Reduced to 4 to minimize API calls

  // Force fresh data on mount and ensure default view
  useEffect(() => {
    console.log('Home component mounted - ensuring default state');
    // Always start in default view
    setView('default');
    // Only refetch if we don't have data and aren't already loading
    if (!multipleRandomRecipes.data && !multipleRandomRecipes.isLoading) {
      multipleRandomRecipes.refetch();
    }
  }, []); // Remove dependency to prevent infinite loops

  // Debug logging
  console.log('Home render:', {
    view,
    multipleRandomRecipesStatus: {
      isLoading: multipleRandomRecipes.isLoading,
      isError: multipleRandomRecipes.isError,
      dataLength: multipleRandomRecipes.data?.length,
      error: multipleRandomRecipes.error
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
    setView('random');
    randomMeal.refetch();
  }, [randomMeal]);

  const handleHome = useCallback(() => {
    setSearch('');
    setSelectedCategory(undefined);
    setView('default');
    multipleRandomRecipes.refetch(); // Refresh random recipes when going home
  }, [multipleRandomRecipes]);

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
      if (multipleRandomRecipes.isLoading) return 'Loading random recipes...';
      if (multipleRandomRecipes.isError) return 'Failed to load random recipes.';
      if (multipleRandomRecipes.data) return `${multipleRandomRecipes.data.length} random recipes loaded.`;
    }
    return '';
  }, [view, search, searchQuery.isLoading, searchQuery.isError, searchQuery.data, categoryMeals.isLoading, categoryMeals.isError, categoryMeals.data, selectedCategory, randomMeal.isLoading, randomMeal.isError, randomMeal.data, categories.isLoading, categories.isError, categories.data, multipleRandomRecipes.isLoading, multipleRandomRecipes.isError, multipleRandomRecipes.data]);

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
    if (randomMeal.isLoading) content = <Loading message="Rolling the dice..." />;
    else if (randomMeal.isError) content = <ErrorDialog message="Failed to fetch random meal." onRetry={handleRandom} />;
    else if (randomMeal.data) content = <RecipeGrid meals={[randomMeal.data]} onSelect={openMeal} />;
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
    // default landing view - show random recipes with better error handling
    console.log('Default view - multipleRandomRecipes state:', {
      isLoading: multipleRandomRecipes.isLoading,
      isError: multipleRandomRecipes.isError,
      data: multipleRandomRecipes.data,
      dataLength: multipleRandomRecipes.data?.length
    });

    if (multipleRandomRecipes.isLoading) {
      console.log('Showing loading state');
      content = <Loading message="Loading random recipes..." />;
    } else if (multipleRandomRecipes.isError) {
      console.log('Showing error state with fallback option');
      content = (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="window" style={{ display: 'inline-block', minWidth: '300px' }}>
            <div className="title-bar">
              <div className="title-bar-text">⚠️ Unable to Load Random Recipes</div>
            </div>
            <div className="window-body" style={{ padding: '16px' }}>
              <p style={{ margin: '0 0 16px', fontSize: '11px' }}>
                The recipe service is temporarily unavailable. You can still:
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => setView('browse')} style={{ fontSize: '11px' }}>
                  Browse Categories
                </button>
                <button onClick={() => multipleRandomRecipes.refetch()} style={{ fontSize: '11px' }}>
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    } else if (multipleRandomRecipes.data && multipleRandomRecipes.data.length > 0) {
      console.log('Showing recipes:', multipleRandomRecipes.data.length);
      content = (
        <div>
          <div style={{ marginBottom: '16px', padding: '8px 0', textAlign: 'center' }}>
            <h2 style={{ margin: '0 0 4px', fontSize: '14px', fontWeight: 'bold' }}>🍴 Discover Random Recipes</h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#666' }}>Click any recipe card to view full details</p>
          </div>
          <RecipeGrid meals={multipleRandomRecipes.data} onSelect={openMeal} />
        </div>
      );
    } else {
      // Fallback when no error but also no data
      console.log('No data available - showing fallback options');
      content = (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="window" style={{ display: 'inline-block', minWidth: '300px' }}>
            <div className="title-bar">
              <div className="title-bar-text">🍽️ Welcome to Recipe Discovery</div>
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

  return (
    <WindowFrame title="Recipe Discovery" className="main-shell" controls={null}>
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
    </WindowFrame>
  );
};