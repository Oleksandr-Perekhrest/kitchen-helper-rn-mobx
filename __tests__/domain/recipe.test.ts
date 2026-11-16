// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { RecipeSchema } from "../../src/domain/recipe";

const FIXTURE_NOW = "2026-11-16T10:00:00.000Z";

const VALID_RECIPE = {
    id: "11111111-1111-4111-a111-111111111111",
    title: "Simple Omelette",
    servings: 2,
    tags: ["breakfast", "vegetarian"],
    favorite: false,
    ingredients: [
        {
            id: "22222222-2222-4222-a222-222222222222",
            name: "Eggs",
            amount: 3,
            unit: "pcs",
        },
        {
            id: "33333333-3333-4333-a333-333333333333",
            name: "Salt",
            unit: "toTaste",
        },
    ],
    steps: [
        {
            id: "44444444-4444-4444-a444-444444444444",
            text: "Beat the eggs and season with salt.",
            ingredientIds: [
                "22222222-2222-4222-a222-222222222222",
                "33333333-3333-4333-a333-333333333333",
            ],
        },
    ],
    createdAt: FIXTURE_NOW,
    updatedAt: FIXTURE_NOW,
};

describe("RecipeSchema", () => {
    describe("valid fixture", () => {
        it("accepts the valid fixture without errors", () => {
            const result = RecipeSchema.safeParse(VALID_RECIPE);
            expect(result.success).toBe(true);
        });
    });

    describe("toTaste ingredient rule", () => {
        it("rejects unit toTaste when amount is provided", () => {
            const recipe = {
                ...VALID_RECIPE,
                ingredients: [
                    VALID_RECIPE.ingredients[0],
                    { ...VALID_RECIPE.ingredients[1], amount: 1 },
                ],
            };
            const result = RecipeSchema.safeParse(recipe);
            expect(result.success).toBe(false);
            const paths = result.error?.issues.map((i) => i.path) ?? [];
            expect(paths).toContainEqual(["ingredients", 1, "amount"]);
        });

        it("rejects non-toTaste unit when amount is absent", () => {
            const recipe = {
                ...VALID_RECIPE,
                ingredients: [
                    {
                        id: "22222222-2222-4222-a222-222222222222",
                        name: "Eggs",
                        unit: "pcs",
                    },
                    VALID_RECIPE.ingredients[1],
                ],
            };
            const result = RecipeSchema.safeParse(recipe);
            expect(result.success).toBe(false);
            const paths = result.error?.issues.map((i) => i.path) ?? [];
            expect(paths).toContainEqual(["ingredients", 0, "amount"]);
        });
    });

    describe("unknown ingredient reference in step", () => {
        it("rejects a step that references an ingredient id not in the recipe", () => {
            const recipe = {
                ...VALID_RECIPE,
                steps: [
                    {
                        ...VALID_RECIPE.steps[0],
                        ingredientIds: ["99999999-9999-4999-a999-999999999999"],
                    },
                ],
            };
            const result = RecipeSchema.safeParse(recipe);
            expect(result.success).toBe(false);
            const paths = result.error?.issues.map((i) => i.path) ?? [];
            expect(paths).toContainEqual(["steps"]);
        });
    });

    describe("whitespace-only strings", () => {
        it("rejects title made only of spaces", () => {
            const result = RecipeSchema.safeParse({
                ...VALID_RECIPE,
                title: "   ",
            });
            expect(result.success).toBe(false);
        });

        it("rejects ingredient name made only of spaces", () => {
            const recipe = {
                ...VALID_RECIPE,
                ingredients: [
                    { ...VALID_RECIPE.ingredients[0], name: "   " },
                    VALID_RECIPE.ingredients[1],
                ],
            };
            const result = RecipeSchema.safeParse(recipe);
            expect(result.success).toBe(false);
        });

        it("rejects step text made only of spaces", () => {
            const recipe = {
                ...VALID_RECIPE,
                steps: [{ ...VALID_RECIPE.steps[0], text: "   " }],
            };
            const result = RecipeSchema.safeParse(recipe);
            expect(result.success).toBe(false);
        });
    });

    describe("duplicate tags", () => {
        it("rejects recipes with duplicate tags", () => {
            const recipe = {
                ...VALID_RECIPE,
                tags: ["breakfast", "breakfast"],
            };
            const result = RecipeSchema.safeParse(recipe);
            expect(result.success).toBe(false);
            const paths = result.error?.issues.map((i) => i.path) ?? [];
            expect(paths).toContainEqual(["tags"]);
        });
    });

    describe("steps required", () => {
        it("rejects recipes with no steps", () => {
            const recipe = { ...VALID_RECIPE, steps: [] };
            const result = RecipeSchema.safeParse(recipe);
            expect(result.success).toBe(false);
        });
    });
});
