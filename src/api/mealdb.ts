import { MealPartial, Category } from '../types/recipe';

const BASE = 'https://www.themealdb.com/api/json/v1/1';

class APIManager {
  private activeRequests = 0;
  private readonly MAX_CONCURRENT = 2; // INCREASE from 1 to 2
  private readonly MIN_INTERVAL = 800;  // DECREASE from 1200ms to 800ms
  private lastRequestTime = 0;
  private errorCount = 0;
  private readonly MAX_ERRORS = 3;

  async safeFetch(url: string): Promise<any> {
    // Check error threshold - fallback to safe mode if too many errors
    if (this.errorCount >= this.MAX_ERRORS) {
      console.warn('SAFE MODE: Too many errors, falling back to single request');
      return this.safeFetchSingleMode(url);
    }

    // Wait for available slot
    while (this.activeRequests >= this.MAX_CONCURRENT) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    this.activeRequests++;

    try {
      // Enforce rate limiting with reduced interval
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.MIN_INTERVAL) {
        await new Promise(resolve => setTimeout(resolve, this.MIN_INTERVAL - timeSinceLastRequest));
      }

      this.lastRequestTime = Date.now();

      // BASIC FETCH - NO CUSTOM HEADERS
      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 429) {
          this.errorCount++;
          console.warn(`RATE LIMIT: Error count now ${this.errorCount}`);
          await new Promise(resolve => setTimeout(resolve, 2000));
          throw new Error('Rate limited');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      // Success - reset error count
      this.errorCount = Math.max(0, this.errorCount - 1);
      return await response.json();

    } finally {
      this.activeRequests--;
    }
  }

  // Fallback to single request mode if errors occur
  private async safeFetchSingleMode(url: string): Promise<any> {
    // Use original safe settings
    while (this.activeRequests >= 1) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    this.activeRequests++;
    
    try {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < 1200) {
        await new Promise(resolve => setTimeout(resolve, 1200 - timeSinceLastRequest));
      }

      this.lastRequestTime = Date.now();

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        if (response.status === 429) {
          await new Promise(resolve => setTimeout(resolve, 3000));
          throw new Error('Rate limited');
        }
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();

    } finally {
      this.activeRequests--;
    }
  }
}

const apiManager = new APIManager();

// SAFE API FUNCTIONS
export async function searchMeals(q: string): Promise<MealPartial[]> {
  try {
    const data = await apiManager.safeFetch(`${BASE}/search.php?s=${encodeURIComponent(q)}`);
    return data.meals || [];
  } catch (error) {
    console.warn('Search failed:', error);
    return [];
  }
}

export async function getMealById(id: string): Promise<MealPartial | null> {
  try {
    const data = await apiManager.safeFetch(`${BASE}/lookup.php?i=${id}`);
    return data.meals?.[0] || null;
  } catch (error) {
    console.warn('Meal lookup failed:', error);
    return null;
  }
}

export async function getRandomMeal(): Promise<MealPartial | null> {
  try {
    const data = await apiManager.safeFetch(`${BASE}/random.php`);
    return data.meals?.[0] || null;
  } catch (error) {
    console.warn('Random meal failed:', error);
    return null;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const data = await apiManager.safeFetch(`${BASE}/categories.php`);
    return data.categories || [];
  } catch (error) {
    console.warn('Categories failed:', error);
    return [];
  }
}

export async function getMealsByCategory(category: string): Promise<MealPartial[]> {
  try {
    const data = await apiManager.safeFetch(`${BASE}/filter.php?c=${encodeURIComponent(category)}`);
    return data.meals || [];
  } catch (error) {
    console.warn('Category meals failed:', error);
    return [];
  }
}
