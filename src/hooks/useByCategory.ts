import { useQuery } from '@tanstack/react-query';
import { getMealsByCategory } from '../api';

export const useByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['meals', 'category', category],
    queryFn: () => getMealsByCategory(category || ''),
    enabled: !!category,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,    // 30 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
