import { useQuery } from '@tanstack/react-query';
import { getMealById } from '../api/mealdb';

// Query key contract: ['recipe', id]
export const useRecipeDetail = (id?: string) => {
  return useQuery({
    queryKey: ['recipe', id],
    queryFn: () => getMealById(id!),
    enabled: !!id,
    staleTime: 60_000,
    gcTime: 300_000,
  });
};
