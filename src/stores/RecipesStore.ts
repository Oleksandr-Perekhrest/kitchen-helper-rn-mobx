// outsource dependencies
import { makeAutoObservable } from "mobx";

// local dependencies
import type { Recipe } from "../domain/recipe";
import { RecipeSchema, RECIPE_SCHEMA_VERSION } from "../domain/recipe";

export const RECIPES_STORAGE_KEY = "recipes";

export function parseRecipes(data: unknown, version: number): Recipe[] | null {
    if (version !== RECIPE_SCHEMA_VERSION) return null;
    if (!Array.isArray(data)) return null;

    const valid: Recipe[] = [];
    let dropped = 0;

    for (const item of data) {
        const result = RecipeSchema.safeParse(item);
        if (result.success) {
            valid.push(result.data);
        } else {
            dropped += 1;
        }
    }

    if (__DEV__ && dropped > 0) {
        console.warn(
            `[RecipesStore] dropped ${dropped} invalid recipe(s) on load`,
        );
    }

    return valid;
}

export class RecipesStore {
    recipes: Recipe[] = [];

    constructor() {
        makeAutoObservable(this);
    }

    get byId(): Map<string, Recipe> {
        return new Map(this.recipes.map((r) => [r.id, r]));
    }

    get favorites(): Recipe[] {
        return this.recipes.filter((r) => r.favorite);
    }

    replaceAll(recipes: Recipe[]) {
        this.recipes = recipes;
    }

    add(recipe: Recipe) {
        this.recipes.push(recipe);
    }

    update(recipe: Recipe) {
        const idx = this.recipes.findIndex((r) => r.id === recipe.id);
        if (idx !== -1) {
            this.recipes[idx] = {
                ...recipe,
                updatedAt: new Date().toISOString(),
            };
        }
    }

    remove(id: string) {
        this.recipes = this.recipes.filter((r) => r.id !== id);
    }

    toggleFavorite(id: string) {
        const idx = this.recipes.findIndex((r) => r.id === id);
        const recipe = this.recipes[idx];
        if (idx !== -1 && recipe !== undefined) {
            this.recipes[idx] = { ...recipe, favorite: !recipe.favorite };
        }
    }
}
