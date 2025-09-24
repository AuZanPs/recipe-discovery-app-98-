import { useQuery } from '@tanstack/react-query';
import { getRandomMeal } from '../api/mealdb';

// Query key contract: ['random'] (always fresh)
export const useRandomRecipe = () => {
  return useQuery({
    queryKey: ['random'],
    queryFn: getRandomMeal,
    staleTime: 0,
    gcTime: 300_000,
  });
};
