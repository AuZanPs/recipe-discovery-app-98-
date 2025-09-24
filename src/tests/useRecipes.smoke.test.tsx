import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { useRecipes } from '../hooks/useRecipes';

jest.mock('../api/mealdb', () => ({
  searchMeals: jest.fn(async (q: string) => ([
    { idMeal: '1', strMeal: 'Meal A', strMealThumb: 'thumb', strCategory: 'Cat', strArea: 'Area', strInstructions: 'Do it.' }
  ]))
}));

const { searchMeals } = jest.requireMock('../api/mealdb');

describe('useRecipes smoke', () => {
  it('returns data and uses the correct query key', async () => {
    const qc = new QueryClient();
    const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    );
    const { result } = renderHook(() => useRecipes('pasta'), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBeTruthy());
    expect(result.current.data?.[0].strMeal).toBe('Meal A');
    expect(searchMeals).toHaveBeenCalledWith('pasta');
  });
});
