import { useQuery } from '@tanstack/react-query';
import { getRandomMeal } from '../api';
import { type MealPartial } from '../types/recipe';

// Fetch multiple random recipes with proper throttling and deduplication
export const useMultipleRandomRecipes = (count: number = 6) => {
  return useQuery({
    queryKey: ['meals', 'random-multiple', count],
    queryFn: async (): Promise<MealPartial[]> => {
      console.log(`Starting to fetch ${count} random recipes sequentially...`);
      
      const results: MealPartial[] = [];
      const seenIds = new Set<string>();
      const maxAttempts = count * 3; // Allow more attempts to get unique recipes
      let attempts = 0;
      
      while (results.length < count && attempts < maxAttempts) {
        attempts++;
        
        try {
          console.log(`Fetching recipe ${results.length + 1}/${count} (attempt ${attempts}/${maxAttempts})...`);
          const meal = await getRandomMeal();
          
          if (meal && meal.idMeal) {
            // Check for duplicates using Set for O(1) lookup
            if (!seenIds.has(meal.idMeal)) {
              console.log(`Got unique recipe: ${meal.strMeal} (ID: ${meal.idMeal})`);
              results.push(meal);
              seenIds.add(meal.idMeal);
            } else {
              console.log(`Duplicate recipe found: ${meal.strMeal} (ID: ${meal.idMeal}), skipping...`);
            }
          } else {
            console.log(`API returned null or invalid meal, skipping... (attempt ${attempts})`);
          }
        } catch (error) {
          console.error(`Failed to fetch recipe (attempt ${attempts}):`, error);
          // Don't throw here - continue trying with remaining attempts
        }
        
        // Progressive delay to be respectful to API
        if (results.length < count && attempts < maxAttempts) {
          const delay = Math.min(100 + (attempts * 50), 500); // 100ms to 500ms
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      
      console.log(`Successfully fetched ${results.length} unique recipes out of ${count} requested`);
      
      // Return what we got, even if it's less than requested
      if (results.length === 0) {
        throw new Error(`Failed to fetch any random recipes after ${attempts} attempts. Please try again.`);
      }
      
      return results;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes - longer caching to reduce API calls
    gcTime: 1000 * 60 * 10, // 10 minutes - keep in memory longer
    retry: 2, // Retry the entire operation if it fails
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
    // Refetch on mount for fresh data experience
    refetchOnMount: true,
    // Don't refetch on window focus for random recipes
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