import { useQuery } from '@tanstack/react-query';
import { getRandomMeal } from '../api';

export const useRandomRecipe = () => {
  return useQuery({
    queryKey: ['meals', 'random'],
    queryFn: getRandomMeal,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    retryDelay: 200,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
