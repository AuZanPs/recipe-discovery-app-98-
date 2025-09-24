// TheMealDB API Types
// NOTE: For filter-by-category responses, only idMeal, strMeal, strMealThumb are returned.
// Therefore most descriptive fields are optional.
export interface Meal {
  idMeal: string;
  strMeal: string;
  strDrinkAlternate?: string;
  strCategory?: string; // optional for filtered results
  strArea?: string;
  strInstructions?: string;
  strMealThumb: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  strImageSource?: string;
  strCreativeCommonsConfirmed?: string;
  dateModified?: string;
  [key: string]: string | undefined; // For dynamic ingredient and measure properties
}

export interface MealResponse {
  meals: Meal[] | null;
}

export interface CategoryResponse {
  categories: Category[];
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface SearchParams {
  query?: string;
  category?: string;
}

// Processed types for easier component usage
export interface ProcessedMeal {
  id: string;
  name: string;
  category: string;
  area: string;
  instructions: string;
  thumbnail: string;
  tags: string[];
  youtube?: string;
  source?: string;
  ingredients: Array<{
    name: string;
    measure: string;
  }>;
}