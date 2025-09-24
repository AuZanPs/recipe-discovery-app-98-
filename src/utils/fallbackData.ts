import { type MealPartial, type Category } from '../types/recipe';

// Fallback data for when API is completely unavailable
export const fallbackRecipes: MealPartial[] = [
  {
    idMeal: 'fallback-1',
    strMeal: 'Classic Spaghetti Carbonara',
    strMealThumb: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
    strCategory: 'Pasta',
    strArea: 'Italian',
    strInstructions: 'Cook pasta according to package directions. Mix eggs, cheese, and pepper. Combine with hot pasta and pancetta.',
    strYoutube: '',
  },
  {
    idMeal: 'fallback-2',
    strMeal: 'Chicken Stir Fry',
    strMealThumb: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop',
    strCategory: 'Chicken',
    strArea: 'Chinese',
    strInstructions: 'Heat oil in wok, add chicken and vegetables. Stir fry until cooked. Add sauce and serve over rice.',
    strYoutube: '',
  },
  {
    idMeal: 'fallback-3',
    strMeal: 'Caesar Salad',
    strMealThumb: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
    strCategory: 'Miscellaneous',
    strArea: 'American',
    strInstructions: 'Toss romaine lettuce with caesar dressing, croutons, and parmesan cheese.',
    strYoutube: '',
  },
];

export const fallbackCategories: Category[] = [
  {
    idCategory: 'fallback-1',
    strCategory: 'Beef',
    strCategoryThumb: 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=300&fit=crop',
    strCategoryDescription: 'Delicious beef dishes from around the world.',
  },
  {
    idCategory: 'fallback-2',
    strCategory: 'Chicken',
    strCategoryThumb: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    strCategoryDescription: 'Tasty chicken recipes for every occasion.',
  },
  {
    idCategory: 'fallback-3',
    strCategory: 'Pasta',
    strCategoryThumb: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=400&h=300&fit=crop',
    strCategoryDescription: 'Italian pasta dishes and more.',
  },
];

// Check if we should use fallback data (after multiple API failures)
export const shouldUseFallbackData = (retryCount: number): boolean => {
  if (retryCount >= 3) {
    console.log('🔄 Using fallback data due to persistent API issues');
    return true;
  }
  return false;
};