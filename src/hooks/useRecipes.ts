import { useQuery } from '@tanstack/react-query';
import { searchMeals } from '../api';
import { useEffect, useState } from 'react';

// simple debounce hook (no external deps)
export function useDebounce<T>(value: T, delay = 250): T {
  const [state, setState] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setState(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return state as T;
}

export const useRecipes = (query: string) => {
  const q = useDebounce(query, 250);
  return useQuery({
    queryKey: ['recipes', q],
    queryFn: () => searchMeals(q),
    enabled: q.length >= 2,
    staleTime: 5 * 60_000, // 5 minutes
    gcTime: 15 * 60_000, // 15 minutes
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
