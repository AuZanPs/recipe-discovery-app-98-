import React, { useState, useCallback, useMemo } from 'react';
import { useRecipes, useRandomRecipe, useCategories, useByCategory } from '../hooks/index';
import { processMeal } from '../types/recipe';
import { getMealById } from '../api/mealdb';
import { WindowFrame } from '../components/WindowFrame/WindowFrame';
import { SearchBar } from '../components/SearchBar/SearchBar';
import { CategoryFilter } from '../components/CategoryFilter/CategoryFilter';
import { RandomRecipeButton } from '../components/RandomRecipeButton/RandomRecipeButton';
import { RecipeGrid } from '../components/RecipeGrid/RecipeGrid';
import { RecipeDetailModal } from '../components/RecipeDetailModal/RecipeDetailModal';
import { Loading } from '../components/States/Loading';
import { ErrorDialog } from '../components/States/ErrorDialog';
import { EmptyState } from '../components/States/EmptyState';
import { MealPartial, ProcessedMeal } from '../types/recipe';

export const Home: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedProcessed, setSelectedProcessed] = useState<ProcessedMeal | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [view, setView] = useState<'default' | 'search' | 'category' | 'random' | 'browse'>('default');

  const searchQuery = useRecipes(search);
  const categories = useCategories();
  const categoryMeals = useByCategory(selectedCategory);
  const randomMeal = useRandomRecipe();

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
      if (categories.isLoading) return 'Loading categories.';
      if (categories.isError) return 'Categories failed to load.';
    }
    return '';
  }, [view, search, searchQuery.isLoading, searchQuery.isError, searchQuery.data, categoryMeals.isLoading, categoryMeals.isError, categoryMeals.data, selectedCategory, randomMeal.isLoading, randomMeal.isError, randomMeal.data, categories.isLoading, categories.isError, categories.data]);

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
    // default landing view (prompt + action)
    if (categories.isLoading) content = <Loading message="Loading categories..." />;
    else if (categories.isError) content = <ErrorDialog message="Failed to load categories." onRetry={() => categories.refetch()} />;
    else content = <EmptyState title="Recipe Discovery" message="Search or browse categories to begin." actionLabel="Random Recipe" onAction={handleRandom} />;
  }

  return (
    <WindowFrame title="Recipe Discovery" className="main-shell" controls={null}>
      <div className="toolbar">
        <SearchBar onSearch={handleSearch} />
        <CategoryFilter categories={categories.data} value={selectedCategory} onChange={handleCategory} />
        <div className="toolbar-buttons" style={{ flexShrink: 0 }}>
          <RandomRecipeButton onClick={handleRandom} active={view === 'random'} />
          <button onClick={() => setView('browse')} className={view === 'browse' ? 'active' : ''}>Categories</button>
          <button onClick={() => { setSelectedCategory(undefined); setView('default'); }} className={view === 'default' ? 'active' : ''}>Home</button>
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
