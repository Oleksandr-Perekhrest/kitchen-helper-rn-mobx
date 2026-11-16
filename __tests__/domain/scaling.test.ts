// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import type { Ingredient } from "../../src/domain/recipe";
import {
    scaleQuantity,
    formatQuantity,
    scaleIngredients,
} from "../../src/domain/scaling";

// ─── fixtures ────────────────────────────────────────────────────────────────

const INGREDIENT_WITH_AMOUNT: Ingredient = {
    id: "11111111-1111-4111-a111-111111111111",
    name: "Eggs",
    amount: 1,
    unit: "pcs",
};

const TO_TASTE_INGREDIENT: Ingredient = {
    id: "22222222-2222-4222-b222-222222222222",
    name: "Salt",
    unit: "toTaste",
};

// ─── scaleQuantity ───────────────────────────────────────────────────────────

describe("scaleQuantity", () => {
    it("scales up: 1 egg for 2 servings → 1.5 for 3", () => {
        expect(scaleQuantity(1, 2, 3)).toBe(1.5);
    });

    it("scales down: 4 for 4 servings → 2 for 2", () => {
        expect(scaleQuantity(4, 4, 2)).toBe(2);
    });

    it("same servings: quantity is unchanged", () => {
        expect(scaleQuantity(3, 2, 2)).toBe(3);
    });

    it("zero base servings: quantity unchanged", () => {
        expect(scaleQuantity(5, 0, 2)).toBe(5);
    });

    it("negative base servings: quantity unchanged", () => {
        expect(scaleQuantity(5, -1, 2)).toBe(5);
    });

    it("zero target servings: quantity unchanged", () => {
        expect(scaleQuantity(5, 2, 0)).toBe(5);
    });

    it("negative target servings: quantity unchanged", () => {
        expect(scaleQuantity(5, 2, -1)).toBe(5);
    });

    it("Infinity base: quantity unchanged", () => {
        expect(scaleQuantity(5, Infinity, 2)).toBe(5);
    });

    it("NaN base: quantity unchanged", () => {
        expect(scaleQuantity(5, NaN, 2)).toBe(5);
    });

    it("Infinity target: quantity unchanged", () => {
        expect(scaleQuantity(5, 2, Infinity)).toBe(5);
    });

    it("NaN target: quantity unchanged", () => {
        expect(scaleQuantity(5, 2, NaN)).toBe(5);
    });
});

// ─── scaleIngredients ────────────────────────────────────────────────────────

describe("scaleIngredients", () => {
    it("toTaste ingredient is returned unchanged (same reference, no amount)", () => {
        const result = scaleIngredients([TO_TASTE_INGREDIENT], 2, 4);
        expect(result[0]).toBe(TO_TASTE_INGREDIENT);
        expect(result[0]?.amount).toBeUndefined();
    });

    it("returns new objects — input ingredient is not mutated", () => {
        const original: Ingredient = { ...INGREDIENT_WITH_AMOUNT, amount: 2 };
        const result = scaleIngredients([original], 2, 4);
        expect(result[0]).not.toBe(original);
        expect(result[0]?.amount).toBe(4);
        expect(original.amount).toBe(2);
    });

    it("scales all ingredients with amounts", () => {
        const ingredients: Ingredient[] = [
            {
                id: "11111111-1111-4111-a111-111111111111",
                name: "Pasta",
                amount: 100,
                unit: "g",
            },
            {
                id: "22222222-2222-4222-b222-222222222222",
                name: "Oil",
                amount: 1,
                unit: "tbsp",
            },
        ];
        const result = scaleIngredients(ingredients, 1, 2);
        expect(result[0]?.amount).toBe(200);
        expect(result[1]?.amount).toBe(2);
    });
});

// ─── formatQuantity ──────────────────────────────────────────────────────────

describe("formatQuantity", () => {
    it('formats 1.5 as "1.5" in English', () => {
        expect(formatQuantity(1.5, "en")).toBe("1.5");
    });

    it('formats 1.5 as "1,5" in Ukrainian (decimal comma)', () => {
        expect(formatQuantity(1.5, "uk")).toBe("1,5");
    });

    it("0.1 * 3 floating-point imprecision is displayed as 0.3", () => {
        expect(formatQuantity(0.1 * 3, "en")).toBe("0.3");
    });

    it("integers are formatted without decimal digits", () => {
        expect(formatQuantity(2, "en")).toBe("2");
        expect(formatQuantity(10, "en")).toBe("10");
    });
});
