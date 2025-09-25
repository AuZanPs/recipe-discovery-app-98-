import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api';
import { FALLBACK_CATEGORIES } from '../utils/fallbackRecipes';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const categories = await getCategories();
        if (categories.length > 0) {
          return categories;
        }
        throw new Error('No categories from API');
      } catch (error) {
        console.warn('Categories failed, using fallback');
        return FALLBACK_CATEGORIES;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 120 * 60 * 1000,   // 2 hours
    retry: 0, // Don't retry to avoid more requests
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
