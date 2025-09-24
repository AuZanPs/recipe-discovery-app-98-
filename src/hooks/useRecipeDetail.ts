import { useQuery } from '@tanstack/react-query';
import { getMealById } from '../api';

export const useRecipeDetail = (id: string) => {
  return useQuery({
    queryKey: ['meals', 'detail', id],
    queryFn: () => getMealById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
  });
};
