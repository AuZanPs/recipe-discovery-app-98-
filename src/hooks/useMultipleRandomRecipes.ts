import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRandomMeal } from '../api';
import { type MealPartial } from '../types/recipe';
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
  return useQuery({
    queryKey: ['random-recipes', count],
    queryFn: async (): Promise<MealPartial[]> => {
      console.log(`DIRECT FETCH: Loading ${count} random recipes (no placeholders)`);
      const recipes = await fetchSequentialRecipes(count);
      
      // Preload all images before reveal for smoother UX
      await imagePreloader.preloadRecipeImages(recipes);
      
      return recipes; // Only genuine API data
    },

    // Show loading-first and avoid stale data flash
    staleTime: 0,
    gcTime: 0, // do not retain cache for randoms to keep UX deterministic
    refetchOnMount: 'always',
    retry: 0,
    refetchOnWindowFocus: false,
    placeholderData: undefined,
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

// Explicit refresh helper to clear any cached randoms and trigger a refetch
export const useRandomRecipeRefresh = () => {
  const queryClient = useQueryClient();
  return () => {
    queryClient.removeQueries({ queryKey: ['random-recipes'] });
    // Invalidate to trigger any active subscribers to refetch
    queryClient.invalidateQueries({ queryKey: ['random-recipes'] });
  };
};