import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRandomMeal } from '../api';
import { type MealPartial } from '../types/recipe';
import { FALLBACK_RECIPES } from '../utils/fallbackRecipes';
import { imagePreloader } from '../utils/imagePreloader';

// Sequential fetcher to avoid overwhelming the API
async function fetchSequentialRecipes(count: number): Promise<MealPartial[]> {
  console.log(`SEQUENTIAL: Fetching ${count} recipes one by one`);
  
  const recipes: MealPartial[] = [];
  const seenIds = new Set<string>();
  
  for (let i = 0; i < count * 2 && recipes.length < count; i++) {
    try {
      console.log(`Fetching recipe ${recipes.length + 1}/${count} (attempt ${i + 1})`);
      const recipe = await getRandomMeal();
      
      if (recipe && recipe.idMeal && !seenIds.has(recipe.idMeal)) {
        recipes.push(recipe);
        seenIds.add(recipe.idMeal);
        console.log(`Got unique recipe: ${recipe.strMeal}`);
        
        // Preload image immediately
        if (recipe.strMealThumb) {
          imagePreloader.preloadImage(recipe.strMealThumb).catch(() => {});
        }
      }
      
    } catch (error) {
      console.warn(`Recipe fetch ${i + 1} failed:`, error);
    }
  }
  
  console.log(`SEQUENTIAL: Got ${recipes.length}/${count} recipes`);
  return recipes;
}

export const useMultipleRandomRecipes = (count: number = 9) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ['random-recipes', count],
    queryFn: async (): Promise<MealPartial[]> => {
      console.log(`INSTANT LOAD: Starting with ${count} fallback recipes`);
      
      // INSTANT RESPONSE: Return fallbacks immediately for initial render
      const fallbacks = FALLBACK_RECIPES.slice(0, count) as MealPartial[];
      
      // Preload fallback images immediately
      imagePreloader.preloadRecipeImages(fallbacks);
      
      // BACKGROUND API FETCH: Load fresh data in background
      setTimeout(async () => {
        try {
          console.log('BACKGROUND: Fetching fresh API recipes');
          const freshRecipes = await fetchSequentialRecipes(count);
          
          if (freshRecipes.length >= Math.floor(count / 2)) {
            // Update cache with fresh data (triggers re-render)
            queryClient.setQueryData(['random-recipes', count], freshRecipes);
            console.log(`BACKGROUND: Updated with ${freshRecipes.length} fresh recipes`);
          }
        } catch (error) {
          console.log('BACKGROUND: API failed, keeping fallbacks');
        }
      }, 100); // Start background fetch after 100ms
      
      return fallbacks; // Return immediately for instant display
    },
    
    staleTime: 5 * 60 * 1000,  // 5 minutes - allow background updates
    gcTime: 30 * 60 * 1000,   // 30 minutes cache
    refetchOnMount: false,     // Don't refetch if data exists
    retry: 0,                  // No retries
    refetchOnWindowFocus: false,
  });
};

// **NEW: Separate hook for home page recipes (6 recipes)**
export const useHomeRandomRecipes = () => {
  return useMultipleRandomRecipes(6);
};

// **NEW: Separate hook for random section recipes (3 recipes)**  
export const useRandomSectionRecipes = () => {
  return useMultipleRandomRecipes(3);
};