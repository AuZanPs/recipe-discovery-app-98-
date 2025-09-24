import { MealPartial, MealsResponse, CategoriesResponse, Category } from '../types/recipe';

// Environment-driven configuration.
// TheMealDB convention: the segment after /v1/ is usually the API key ("1" for test/free key).
// Allow overriding via Vite env variables placed in .env (never commit secrets directly!).
const API_KEY = import.meta.env.VITE_MEALDB_API_KEY || '1';
const BASE = (import.meta.env.VITE_MEALDB_BASE_URL as string | undefined) || `https://www.themealdb.com/api/json/v1/${API_KEY}`;

async function getJSON<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed (${res.status})`);
  }
  return res.json();
}

export async function searchMeals(q: string): Promise<MealPartial[]> {
  const data = await getJSON<MealsResponse>(`${BASE}/search.php?s=${encodeURIComponent(q)}`);
  return data.meals || [];
}

export async function getMealById(id: string): Promise<MealPartial | null> {
  const data = await getJSON<MealsResponse>(`${BASE}/lookup.php?i=${id}`);
  return data.meals?.[0] || null;
}

export async function getRandomMeal(): Promise<MealPartial | null> {
  const data = await getJSON<MealsResponse>(`${BASE}/random.php`);
  return data.meals?.[0] || null;
}

export async function getCategories(): Promise<Category[]> {
  const data = await getJSON<CategoriesResponse>(`${BASE}/categories.php`);
  return data.categories;
}

export async function getMealsByCategory(category: string): Promise<MealPartial[]> {
  const data = await getJSON<MealsResponse>(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
  return data.meals || [];
}
