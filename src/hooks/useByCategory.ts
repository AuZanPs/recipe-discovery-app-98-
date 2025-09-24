import { useQuery } from '@tanstack/react-query';
import { getMealsByCategory } from '../api';

export const useByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['meals', 'category', category],
    queryFn: () => getMealsByCategory(category || ''),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });
};
