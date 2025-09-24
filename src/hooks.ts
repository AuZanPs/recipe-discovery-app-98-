import { useQuery } from '@tanstack/react-query';
import { mealAPI } from './api';

// Custom hooks for data fetching with TanStack Query
export const useSearchMeals = (query: string) => {
  return useQuery({
    queryKey: ['meals', 'search', query],
    queryFn: () => mealAPI.searchByName(query),
    enabled: query.length > 0,
    staleTime: 1000 * 60 * 1, // 1 minute
    gcTime: 1000 * 60 * 5, // keep cache 5 minutes
  });
};

export const useMealById = (id: string) => {
  return useQuery({
    queryKey: ['meals', 'detail', id],
    queryFn: () => mealAPI.getMealById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 30, // 30 minutes (rarely changes)
    gcTime: 1000 * 60 * 60, // keep an hour
  });
};

export const useRandomMeal = () => {
  return useQuery({
    queryKey: ['meals', 'random'],
    queryFn: mealAPI.getRandomMeal,
    staleTime: 0, // Always fresh
  });
};

export const useMealsByCategory = (category?: string) => {
  return useQuery({
    queryKey: ['meals', 'category', category],
    queryFn: () => mealAPI.getByCategory(category || ''),
    enabled: !!category,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: mealAPI.getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 120,
  });
};