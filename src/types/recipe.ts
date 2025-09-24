// Core MealDB types (only fields we actually use)
export interface MealPartial {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strCategory?: string;
  strArea?: string;
  strInstructions?: string;
  strTags?: string;
  strYoutube?: string;
  strSource?: string;
  [key: string]: string | undefined;
}

export interface Category {
  idCategory: string;
  strCategory: string;
  strCategoryThumb: string;
  strCategoryDescription: string;
}

export interface CategoriesResponse { categories: Category[]; }
export interface MealsResponse { meals: MealPartial[] | null; }

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
  ingredients: { name: string; measure: string }[];
}

export const processMeal = (meal: MealPartial): ProcessedMeal => {
  const ingredients: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ing = meal[`strIngredient${i}`];
    const meas = meal[`strMeasure${i}`];
    if (ing && ing.trim()) {
      ingredients.push({ name: ing.trim(), measure: (meas || '').trim() });
    }
  }
  return {
    id: meal.idMeal,
    name: meal.strMeal,
    category: meal.strCategory?.trim() || '',
    area: meal.strArea?.trim() || '',
    instructions: meal.strInstructions || 'No instructions available. Open full recipe to fetch details.',
    thumbnail: meal.strMealThumb,
    tags: meal.strTags ? meal.strTags.split(',').map(t => t.trim()) : [],
    youtube: meal.strYoutube,
    source: meal.strSource,
    ingredients,
  };
};
