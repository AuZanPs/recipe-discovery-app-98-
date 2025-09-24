import { Meal, MealResponse, CategoryResponse, ProcessedMeal, Category } from './types';

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// API functions for TheMealDB
export const mealAPI = {
  // Search meals by name
  searchByName: async (name: string): Promise<Meal[]> => {
    const response = await fetch(`${BASE_URL}/search.php?s=${encodeURIComponent(name)}`);
    if (!response.ok) {
      throw new Error('Failed to search meals');
    }
    const data: MealResponse = await response.json();
    return data.meals || [];
  },

  // Get meal by ID
  getMealById: async (id: string): Promise<Meal | null> => {
    const response = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    if (!response.ok) {
      throw new Error('Failed to get meal');
    }
    const data: MealResponse = await response.json();
    return data.meals?.[0] || null;
  },

  // Get random meal
  getRandomMeal: async (): Promise<Meal | null> => {
    const response = await fetch(`${BASE_URL}/random.php`);
    if (!response.ok) {
      throw new Error('Failed to get random meal');
    }
    const data: MealResponse = await response.json();
    return data.meals?.[0] || null;
  },

  // Filter by category (returns partial meals: idMeal, strMeal, strMealThumb)
  getByCategory: async (category: string): Promise<Meal[]> => {
    const response = await fetch(`${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error('Failed to filter by category');
    }
    const data: MealResponse = await response.json();
    return data.meals || [];
  },

  // Get all categories full objects
  getCategories: async (): Promise<Category[]> => {
    const response = await fetch(`${BASE_URL}/categories.php`);
    if (!response.ok) {
      throw new Error('Failed to get categories');
    }
    const data: CategoryResponse = await response.json();
    return data.categories;
  },
};

// Utility function to process meal data
export const processMeal = (meal: Meal): ProcessedMeal => {
  const ingredients: Array<{ name: string; measure: string }> = [];
  
  // Extract ingredients and measures (they're stored as strIngredient1, strMeasure1, etc.)
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        name: ingredient.trim(),
        measure: measure?.trim() || '',
      });
    }
  }

  return {
    id: meal.idMeal,
    name: meal.strMeal,
    // Leave empty string if missing so UI can decide whether to render or fallback.
    category: meal.strCategory?.trim() || '',
    area: meal.strArea?.trim() || '',
    instructions: meal.strInstructions || 'No instructions available for this partial listing. Open full recipe to load details.',
    thumbnail: meal.strMealThumb,
    tags: meal.strTags ? meal.strTags.split(',').map(tag => tag.trim()) : [],
    youtube: meal.strYoutube,
    source: meal.strSource,
    ingredients,
  };
};