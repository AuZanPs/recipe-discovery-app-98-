import { useQuery } from '@tanstack/react-query';
import { searchMeals } from '../api/mealdb';

// Query key contract: ['recipes', query]
// Rationale: stable list key for search results; normalized timing per project defaults.
export const useRecipes = (query: string) => {
  return useQuery({
    queryKey: ['recipes', query],
    queryFn: () => searchMeals(query),
    enabled: query.trim().length > 0,
    staleTime: 60_000,
    gcTime: 300_000,
  });
};
