import { FALLBACK_RECIPES } from './fallbackRecipes';

class ImagePreloader {
  private cache = new Set<string>();
  private loading = new Set<string>();

  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.cache.has(src)) {
        resolve();
        return;
      }

      if (this.loading.has(src)) {
        // Wait for existing load
        const checkInterval = setInterval(() => {
          if (this.cache.has(src) || !this.loading.has(src)) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 50);
        return;
      }

      this.loading.add(src);
      
      const img = new Image();
      img.onload = () => {
        this.cache.add(src);
        this.loading.delete(src);
        resolve();
      };
      img.onerror = () => {
        this.loading.delete(src);
        reject();
      };
      
      img.src = src;
    });
  }

  async preloadRecipeImages(recipes: any[]): Promise<void> {
    if (!recipes || recipes.length === 0) return;
    
    console.log(`PRELOAD: Starting image preload for ${recipes.length} recipes`);
    
    const imagePromises = recipes
      .filter(recipe => recipe?.strMealThumb)
      .map(recipe => 
        this.preloadImage(recipe.strMealThumb).catch(() => {})
      );

    await Promise.allSettled(imagePromises);
    console.log('PRELOAD: Image preloading complete');
  }

  preloadFallbackImages(): void {
    if (FALLBACK_RECIPES && FALLBACK_RECIPES.length > 0) {
      console.log(`PRELOAD: Starting fallback image preload for ${FALLBACK_RECIPES.length} recipes`);
      FALLBACK_RECIPES.forEach(recipe => {
        if (recipe.strMealThumb) {
          this.preloadImage(recipe.strMealThumb).catch(() => {});
        }
      });
    }
  }
}

export const imagePreloader = new ImagePreloader();

// Safe initialization - only run in browser environment
if (typeof window !== 'undefined') {
  setTimeout(() => {
    imagePreloader.preloadFallbackImages();
  }, 1000);
}