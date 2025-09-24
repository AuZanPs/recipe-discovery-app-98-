import { useQuery } from '@tanstack/react-query';
import { getMealsByCategory } from '../api/mealdb';

// Query key contract: ['byCategory', category]
export const useByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['byCategory', category],
    queryFn: () => getMealsByCategory(category || ''),
    enabled: !!category,
    staleTime: 60_000,
    gcTime: 300_000,
  });
};
