import { MealPartial, MealsResponse, CategoriesResponse, Category } from '../types/recipe';

// Environment-driven configuration.
// TheMealDB convention: the segment after /v1/ is usually the API key ("1" for test/free key).
// Allow overriding via Vite env variables placed in .env (never commit secrets directly!).
const API_KEY = import.meta.env.VITE_MEALDB_API_KEY || '1';
const BASE = (import.meta.env.VITE_MEALDB_BASE_URL as string | undefined) || `https://www.themealdb.com/api/json/v1/${API_KEY}`;

// Request throttling to prevent rate limiting
class RequestThrottler {
  private lastRequestTime = 0;
  private readonly minInterval = 1000; // 1 second between requests
  private requestQueue: Array<() => void> = [];
  private processing = false;

  async throttledFetch<T>(url: string, maxRetries = 3): Promise<T> {
    return new Promise((resolve, reject) => {
      this.requestQueue.push(async () => {
        try {
          const result = await this.executeWithRetry<T>(url, maxRetries);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.processing || this.requestQueue.length === 0) return;
    
    this.processing = true;
    
    while (this.requestQueue.length > 0) {
      const request = this.requestQueue.shift()!;
      
      // Ensure minimum interval between requests
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;
      if (timeSinceLastRequest < this.minInterval) {
        await new Promise(resolve => setTimeout(resolve, this.minInterval - timeSinceLastRequest));
      }
      
      this.lastRequestTime = Date.now();
      await request();
    }
    
    this.processing = false;
  }

  private async executeWithRetry<T>(url: string, maxRetries: number): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Create timeout signal for older browsers compatibility
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId); // Clear timeout if request completes
        
        if (!res.ok) {
          if (res.status === 429) {
            // Rate limited - wait longer before retry
            const delay = Math.pow(2, attempt) * 2000; // Exponential backoff
            console.log(`Rate limited (429). Retrying in ${delay}ms... (attempt ${attempt}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw new Error(`Request failed (${res.status}): ${res.statusText}`);
        }
        
        return await res.json();
      } catch (error) {
        lastError = error as Error;
        console.error(`API request failed (attempt ${attempt}/${maxRetries}):`, error);
        
        if (attempt < maxRetries) {
          // Exponential backoff for retries
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw new Error(`Failed after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
  }
}

// Global throttler instance
const throttler = new RequestThrottler();

// Wrapper function that uses throttling
async function getJSON<T>(url: string): Promise<T> {
  return throttler.throttledFetch<T>(url);
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
