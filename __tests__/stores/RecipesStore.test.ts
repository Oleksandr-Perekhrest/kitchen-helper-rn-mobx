// outsource dependencies
import { it, jest, expect, describe } from "@jest/globals";

// local dependencies
import type { Recipe } from "../../src/domain/recipe";
import { parseRecipes } from "../../src/stores/RecipesStore";
import { RECIPE_SCHEMA_VERSION } from "../../src/domain/recipe";

// ─── fixture ──────────────────────────────────────────────────────────────────

const NOW = "2026-11-16T10:00:00.000Z";

const VALID_RECIPE: Recipe = {
    id: "aaaa0001-0001-4001-a001-000000000001",
    title: "Simple Omelette",
    servings: 2,
    tags: ["breakfast", "vegetarian"],
    favorite: false,
    ingredients: [
        {
            id: "aaaa0001-0001-4001-a001-000000000002",
            name: "Eggs",
            amount: 3,
            unit: "pcs",
        },
        {
            id: "aaaa0001-0001-4001-a001-000000000003",
            name: "Salt",
            unit: "toTaste",
        },
    ],
    steps: [
        {
            id: "aaaa0001-0001-4001-a001-000000000004",
            text: "Beat the eggs and season with salt.",
            ingredientIds: [
                "aaaa0001-0001-4001-a001-000000000002",
                "aaaa0001-0001-4001-a001-000000000003",
            ],
        },
    ],
    createdAt: NOW,
    updatedAt: NOW,
};

// missing required "steps" field — invalid by schema
const INVALID_RECIPE = {
    id: "not-a-uuid",
    title: "Bad Recipe",
    servings: 1,
    tags: [],
    favorite: false,
    ingredients: [],
    createdAt: NOW,
    updatedAt: NOW,
};

// ─── tests ────────────────────────────────────────────────────────────────────

describe("parseRecipes", () => {
    it("array with one valid and one invalid recipe returns exactly the valid one", () => {
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => {});
        try {
            const result = parseRecipes(
                [VALID_RECIPE, INVALID_RECIPE],
                RECIPE_SCHEMA_VERSION,
            );
            expect(result).toHaveLength(1);
            expect(result?.[0]?.id).toBe(
                "aaaa0001-0001-4001-a001-000000000001",
            );
            expect(warnSpy).toHaveBeenCalledTimes(1);
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining("dropped 1"),
            );
        } finally {
            warnSpy.mockRestore();
        }
    });

    it("non-array data returns null", () => {
        expect(parseRecipes(null, RECIPE_SCHEMA_VERSION)).toBeNull();
        expect(parseRecipes({ id: "x" }, RECIPE_SCHEMA_VERSION)).toBeNull();
        expect(parseRecipes("string", RECIPE_SCHEMA_VERSION)).toBeNull();
        expect(parseRecipes(42, RECIPE_SCHEMA_VERSION)).toBeNull();
    });

    it("unknown version returns null", () => {
        expect(parseRecipes([VALID_RECIPE], 0)).toBeNull();
        expect(parseRecipes([VALID_RECIPE], 2)).toBeNull();
    });
});
