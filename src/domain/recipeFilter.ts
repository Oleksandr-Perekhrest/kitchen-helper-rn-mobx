// local dependencies
import type { Tag, Recipe } from "./recipe";

export type RecipeFilter = {
    query: string;
    tag: Tag | null;
    favoritesOnly: boolean;
};

const APOSTROPHE_RE = /[‘’ʼ]/g;

export function normalizeSearchText(text: string): string {
    return text.toLocaleLowerCase().replace(APOSTROPHE_RE, "'");
}

export function filterRecipes(
    recipes: Recipe[],
    filter: RecipeFilter,
): Recipe[] {
    const { query, tag, favoritesOnly } = filter;
    const normalizedQuery = normalizeSearchText(query.trim());
    return recipes.filter((recipe) => {
        if (favoritesOnly && !recipe.favorite) return false;
        if (tag !== null && !recipe.tags.includes(tag)) return false;
        if (normalizedQuery === "") return true;
        if (normalizeSearchText(recipe.title).includes(normalizedQuery))
            return true;
        return recipe.ingredients.some((ingredient) =>
            normalizeSearchText(ingredient.name).includes(normalizedQuery),
        );
    });
}
