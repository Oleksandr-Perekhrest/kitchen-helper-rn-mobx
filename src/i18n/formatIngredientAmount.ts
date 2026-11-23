// outsource dependencies
import type { TFunction } from "i18next";

// local dependencies
import { tUnit } from "./tUnit";
import type { Ingredient } from "../domain/recipe";
import { formatQuantity } from "../domain/scaling";

export function formatIngredientAmount(
    t: TFunction,
    language: string,
    ingredient: Ingredient,
): string {
    if (ingredient.unit === "toTaste") {
        return t("units.toTaste");
    }
    if (ingredient.amount !== undefined) {
        const { amount, unit } = ingredient;
        return `${formatQuantity(amount, language)} ${tUnit(t, unit, amount)}`;
    }
    return "";
}
