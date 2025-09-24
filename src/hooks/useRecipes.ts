import { useQuery } from '@tanstack/react-query';
import { searchMeals } from '../api';

export const useRecipes = (query: string) => {
  return useQuery({
    queryKey: ['recipes', query],
    queryFn: () => searchMeals(query),
    enabled: query.length >= 2,
    staleTime: 60_000, // 1 minute
    gcTime: 300_000, // 5 minutes
  });
};
