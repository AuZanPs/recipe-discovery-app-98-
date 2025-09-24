import { useQuery } from '@tanstack/react-query';
import { getRandomMeal } from '../api';
import { type MealPartial } from '../types/recipe';

// Fetch multiple random recipes for the home page with proper throttling
export const useMultipleRandomRecipes = (count: number = 6) => {
  return useQuery({
    queryKey: ['meals', 'random-multiple', count],
    queryFn: async (): Promise<MealPartial[]> => {
      console.log(`Starting to fetch ${count} random recipes sequentially...`);
      
      const results: MealPartial[] = [];
      const maxAttempts = count * 2; // Allow more attempts to get unique recipes
      let attempts = 0;
      
      while (results.length < count && attempts < maxAttempts) {
        attempts++;
        
        try {
          console.log(`Fetching recipe ${results.length + 1} (attempt ${attempts}/${maxAttempts})...`);
          const meal = await getRandomMeal();
          
          if (meal) {
            // Check for duplicates
            const isDuplicate = results.some(existing => existing.idMeal === meal.idMeal);
            
            if (!isDuplicate) {
              console.log(`✅ Got unique recipe: ${meal.strMeal}`);
              results.push(meal);
            } else {
              console.log(`⚠️ Duplicate recipe found: ${meal.strMeal}, skipping...`);
            }
          } else {
            console.log('⚠️ API returned null, skipping...');
          }
        } catch (error) {
          console.error(`❌ Failed to fetch recipe (attempt ${attempts}):`, error);
          // Don't throw here - continue trying with remaining attempts
        }
        
        // Small delay between requests (handled by throttler, but adding safety delay)
        if (results.length < count && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }
      
      console.log(`✅ Successfully fetched ${results.length} unique recipes out of ${count} requested`);
      
      // Return what we got, even if it's less than requested
      if (results.length === 0) {
        throw new Error('Failed to fetch any random recipes. Please try again.');
      }
      
      return results;
    },
    enabled: true,
    staleTime: 1000 * 60 * 5, // 5 minutes - longer caching to reduce API calls
    gcTime: 1000 * 60 * 10, // 10 minutes
    retry: 2, // Retry the entire operation if it fails
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000), // Exponential backoff
  });
};