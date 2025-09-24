import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api/mealdb';

// Query key contract: ['categories']
export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 60_000,
    gcTime: 300_000,
  });
};
