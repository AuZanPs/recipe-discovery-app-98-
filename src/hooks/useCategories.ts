import { useQuery } from '@tanstack/react-query';
import { getCategories } from '../api';

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour - categories rarely change
    gcTime: 1000 * 60 * 120, // 2 hours
    retry: 3, // More retries for categories since they're important
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 5000),
  });
};
