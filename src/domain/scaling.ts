// local dependencies
import type { Ingredient } from "./recipe";

export function scaleQuantity(
    quantity: number,
    baseServings: number,
    targetServings: number,
): number {
    if (
        !Number.isFinite(baseServings) ||
        baseServings <= 0 ||
        !Number.isFinite(targetServings) ||
        targetServings <= 0
    ) {
        return quantity;
    }
    return (quantity * targetServings) / baseServings;
}

export function scaleIngredients(
    ingredients: Ingredient[],
    baseServings: number,
    targetServings: number,
): Ingredient[] {
    return ingredients.map((ingredient) => {
        if (ingredient.amount === undefined) return ingredient;
        return {
            ...ingredient,
            amount: scaleQuantity(
                ingredient.amount,
                baseServings,
                targetServings,
            ),
        };
    });
}

// Display precision only — the stored value is never rounded.
export function formatQuantity(value: number, language: string): string {
    return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(
        value,
    );
}
