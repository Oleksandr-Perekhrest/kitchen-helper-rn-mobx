// outsource dependencies
import { it, jest, expect, describe } from "@jest/globals";

// local dependencies
import type { Recipe } from "../../src/domain/recipe";
import { createRootStore } from "../../src/stores/RootStore";
import { RECIPE_SCHEMA_VERSION } from "../../src/domain/recipe";
import { createMemoryStorage } from "../../src/storage/memoryStorage";
import { RecipesStore, parseRecipes } from "../../src/stores/RecipesStore";

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

// ─── RecipesStore.toggleFavorite ─────────────────────────────────────────────

describe("RecipesStore.toggleFavorite", () => {
    it("flips favorite from false to true", () => {
        const store = new RecipesStore();
        store.add(VALID_RECIPE);
        store.toggleFavorite(VALID_RECIPE.id);
        expect(store.recipes[0]?.favorite).toBe(true);
    });

    it("does not change updatedAt", () => {
        const store = new RecipesStore();
        store.add(VALID_RECIPE);
        store.toggleFavorite(VALID_RECIPE.id);
        expect(store.recipes[0]?.updatedAt).toBe(NOW);
    });

    it("toggling twice restores the original favorite value", () => {
        const store = new RecipesStore();
        store.add(VALID_RECIPE); // favorite: false
        store.toggleFavorite(VALID_RECIPE.id);
        expect(store.recipes[0]?.favorite).toBe(true);
        store.toggleFavorite(VALID_RECIPE.id);
        expect(store.recipes[0]?.favorite).toBe(false);
    });
});

// ─── toggleFavorite persistence ──────────────────────────────────────────────

const NOW_DATE = new Date("2026-11-16T10:00:00.000Z");
const NOW_FN = () => NOW_DATE;

describe("toggleFavorite persistence", () => {
    it("favorite set via toggleFavorite survives a simulated app restart", () => {
        const storage = createMemoryStorage();
        const store1 = createRootStore(storage, {
            deviceLanguages: ["en"],
            now: NOW_FN,
        });

        const recipe = store1.recipes.recipes[0];
        if (recipe === undefined) throw new Error("no demo recipes seeded");

        expect(recipe.favorite).toBe(false);
        store1.recipes.toggleFavorite(recipe.id);
        expect(store1.recipes.recipes[0]?.favorite).toBe(true);
        store1.dispose();

        const store2 = createRootStore(storage, {
            deviceLanguages: ["en"],
            now: NOW_FN,
        });
        const restored = store2.recipes.recipes.find((r) => r.id === recipe.id);
        expect(restored?.favorite).toBe(true);
        store2.dispose();
    });
});

describe("RecipesStore.remove", () => {
    it("removes only the recipe with that id", () => {
        const store = new RecipesStore();
        const other = {
            ...VALID_RECIPE,
            id: "aaaa0001-0001-4001-a001-0000000000ff",
        };
        store.replaceAll([VALID_RECIPE, other]);
        store.remove(VALID_RECIPE.id);
        expect(store.recipes.map((r) => r.id)).toEqual([other.id]);
    });

    it("does nothing for an unknown id", () => {
        const store = new RecipesStore();
        store.replaceAll([VALID_RECIPE]);
        store.remove("aaaa0001-0001-4001-a001-0000000000ee");
        expect(store.recipes).toHaveLength(1);
    });
});

describe("remove persistence", () => {
    it("a deleted demo recipe is not re-seeded after a restart", () => {
        const storage = createMemoryStorage();
        const options = {
            deviceLanguages: ["en"],
            now: () => new Date(NOW),
        };
        const first = createRootStore(storage, options);
        const removedId = first.recipes.recipes[0]?.id ?? "";
        const countBefore = first.recipes.recipes.length;
        first.recipes.remove(removedId);
        first.dispose();

        const second = createRootStore(storage, options);
        expect(second.recipes.recipes).toHaveLength(countBefore - 1);
        expect(second.recipes.recipes.map((r) => r.id)).not.toContain(
            removedId,
        );
        second.dispose();
    });
});
