import { useQuery } from '@tanstack/react-query';
import { getRandomMeal } from '../api';

export const useRandomRecipe = () => {
  return useQuery({
    queryKey: ['meals', 'random'],
    queryFn: getRandomMeal,
    staleTime: 0, // Always fresh
    gcTime: 1000 * 60 * 5, // 5 minutes
  });
};
