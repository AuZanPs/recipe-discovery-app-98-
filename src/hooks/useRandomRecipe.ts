import { useQuery } from '@tanstack/react-query';
import { getRandomMeal } from '../api';

export const useRandomRecipe = () => {
  return useQuery({
    queryKey: ['meals', 'random'],
    queryFn: getRandomMeal,
    staleTime: 0, // Always fresh for single random recipe
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 2, // Retry failed requests
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 3000),
  });
};
