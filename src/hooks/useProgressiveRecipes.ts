import { useState, useEffect } from 'react';
import { getRandomMeal } from '../api';
import { FALLBACK_RECIPES } from '../utils/fallbackRecipes';
import { imagePreloader } from '../utils/imagePreloader';

export const useProgressiveRecipes = (targetCount: number = 9) => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCount, setLoadingCount] = useState(0);

  useEffect(() => {
    const loadAllAtOnce = async () => {
      console.log(`BATCH LOADING: Loading all ${targetCount} recipes silently`);
      
      // Start with fallbacks as backup (but don't show yet)
      const initialFallbacks = FALLBACK_RECIPES.slice(0, targetCount);
      const loadedRecipes: any[] = [];
      const seenIds = new Set<string>();
      
      // Load all recipes in background
      for (let i = 0; i < targetCount; i++) {
        try {
          console.log(`BATCH LOADING: Loading recipe ${i + 1}/${targetCount} in background`);
          setLoadingCount(i + 1); // Update counter for existing loading display
          
          const recipe = await getRandomMeal();
          
          if (recipe && recipe.idMeal && !seenIds.has(recipe.idMeal)) {
            loadedRecipes.push(recipe);
            seenIds.add(recipe.idMeal);
          } else {
            // Use fallback if API failed or duplicate
            if (initialFallbacks[i] && !seenIds.has(initialFallbacks[i].idMeal)) {
              loadedRecipes.push(initialFallbacks[i]);
              seenIds.add(initialFallbacks[i].idMeal);
            }
          }
          
        } catch (error) {
          console.log(`BATCH LOADING: Error loading recipe ${i + 1}, using fallback`);
          // Use fallback on error
          if (initialFallbacks[i] && !seenIds.has(initialFallbacks[i].idMeal)) {
            loadedRecipes.push(initialFallbacks[i]);
            seenIds.add(initialFallbacks[i].idMeal);
          }
        }
      }
      
      console.log(`BATCH LOADING: All recipes loaded, preloading ${loadedRecipes.length} images`);
      
      // Preload all images before showing
      await imagePreloader.preloadRecipeImages(loadedRecipes);
      
      // NOW show all recipes at once
      setRecipes(loadedRecipes);
      setIsLoading(false);
      console.log(`BATCH LOADING: Revealing all ${loadedRecipes.length} recipes simultaneously`);
    };
    
    loadAllAtOnce();
  }, [targetCount]);

  return { recipes, isLoading, loadingCount };
};