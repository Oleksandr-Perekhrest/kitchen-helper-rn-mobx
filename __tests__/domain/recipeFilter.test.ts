// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import type { Recipe } from "../../src/domain/recipe";
import {
    filterRecipes,
    normalizeSearchText,
} from "../../src/domain/recipeFilter";

// ─── fixtures ────────────────────────────────────────────────────────────────

const NOW = "2026-11-16T10:00:00.000Z";

function makeRecipe(overrides: {
    id: string;
    title: string;
    tags?: Recipe["tags"];
    favorite?: boolean;
    ingredients?: Recipe["ingredients"];
}): Recipe {
    return {
        id: overrides.id,
        title: overrides.title,
        servings: 2,
        tags: overrides.tags ?? [],
        favorite: overrides.favorite ?? false,
        ingredients: overrides.ingredients ?? [
            {
                id: "ffffffff-ffff-4fff-afff-ffffffffffff",
                name: "Water",
                amount: 1,
                unit: "l",
            },
        ],
        steps: [
            {
                id: "eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee",
                text: "Cook.",
                ingredientIds: [],
            },
        ],
        createdAt: NOW,
        updatedAt: NOW,
    };
}

// "Pasta Carbonara" — title contains 'o'; ingredients: Pasta, Eggs
const PASTA = makeRecipe({
    id: "11111111-1111-4111-a111-111111111111",
    title: "Pasta Carbonara",
    tags: ["main"],
    ingredients: [
        {
            id: "44444444-4444-4444-a444-444444444444",
            name: "Pasta",
            amount: 200,
            unit: "g",
        },
        {
            id: "55555555-5555-4555-a555-555555555555",
            name: "Eggs",
            amount: 2,
            unit: "pcs",
        },
    ],
});

// "Борщ" — Ukrainian, favorite; ingredient "М'ясо" uses U+2019 right single quotation mark
const BORSCHT = makeRecipe({
    id: "22222222-2222-4222-b222-222222222222",
    title: "Борщ",
    tags: ["soup"],
    favorite: true,
    ingredients: [
        {
            id: "66666666-6666-4666-a666-666666666666",
            name: "Буряк",
            amount: 300,
            unit: "g",
        },
        {
            id: "77777777-7777-4777-a777-777777777777",
            name: "М’ясо",
            amount: 500,
            unit: "g",
        },
    ],
});

// "Omelette" — title contains 'O'; ingredients: Eggs + Salt (toTaste)
const OMELETTE = makeRecipe({
    id: "33333333-3333-4333-b333-333333333333",
    title: "Omelette",
    tags: ["breakfast", "vegetarian"],
    ingredients: [
        {
            id: "88888888-8888-4888-a888-888888888888",
            name: "Eggs",
            amount: 3,
            unit: "pcs",
        },
        {
            id: "99999999-9999-4999-a999-999999999999",
            name: "Salt",
            unit: "toTaste",
        },
    ],
});

const ALL: Recipe[] = [PASTA, BORSCHT, OMELETTE];

// ─── normalizeSearchText ──────────────────────────────────────────────────────

describe("normalizeSearchText", () => {
    it("lowercases the text", () => {
        expect(normalizeSearchText("CHICKEN")).toBe("chicken");
    });

    it("normalizes right single quotation mark (U+2019) to ASCII apostrophe", () => {
        expect(normalizeSearchText("м’ясо")).toBe("м'ясо");
    });

    it("normalizes left single quotation mark (U+2018) to ASCII apostrophe", () => {
        expect(normalizeSearchText("м‘ясо")).toBe("м'ясо");
    });

    it("normalizes Ukrainian modifier letter apostrophe (U+02BC) to ASCII apostrophe", () => {
        expect(normalizeSearchText("мʼясо")).toBe("м'ясо");
    });
});

// ─── filterRecipes ───────────────────────────────────────────────────────────

describe("filterRecipes", () => {
    it("empty query matches all recipes", () => {
        const result = filterRecipes(ALL, {
            query: "",
            tag: null,
            favoritesOnly: false,
        });
        expect(result).toHaveLength(3);
    });

    it("whitespace-only query matches all recipes", () => {
        const result = filterRecipes(ALL, {
            query: "   ",
            tag: null,
            favoritesOnly: false,
        });
        expect(result).toHaveLength(3);
    });

    it("case-insensitive title match", () => {
        const result = filterRecipes(ALL, {
            query: "PASTA",
            tag: null,
            favoritesOnly: false,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(PASTA.id);
    });

    it("partial title match", () => {
        const result = filterRecipes(ALL, {
            query: "arb",
            tag: null,
            favoritesOnly: false,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(PASTA.id);
    });

    it("ingredient name match", () => {
        const result = filterRecipes(ALL, {
            query: "eggs",
            tag: null,
            favoritesOnly: false,
        });
        const ids = result.map((r) => r.id);
        expect(ids).toContain(PASTA.id);
        expect(ids).toContain(OMELETTE.id);
        expect(ids).not.toContain(BORSCHT.id);
    });

    it("Ukrainian apostrophe variants match each other (U+02BC query vs U+2019 stored)", () => {
        // BORSCHT has ingredient "М'ясо" with right single quotation mark (U+2019).
        // Searching with Ukrainian modifier apostrophe (U+02BC) should still match.
        const result = filterRecipes(ALL, {
            query: "мʼясо",
            tag: null,
            favoritesOnly: false,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(BORSCHT.id);
    });

    it("tag filter returns only recipes with that tag", () => {
        const result = filterRecipes(ALL, {
            query: "",
            tag: "soup",
            favoritesOnly: false,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(BORSCHT.id);
    });

    it("favoritesOnly returns only favorite recipes", () => {
        const result = filterRecipes(ALL, {
            query: "",
            tag: null,
            favoritesOnly: true,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(BORSCHT.id);
    });

    it("tag + favoritesOnly combined with AND logic (both must match)", () => {
        // BORSCHT: favorite=true AND tags=["soup"] → matches
        const result = filterRecipes(ALL, {
            query: "",
            tag: "soup",
            favoritesOnly: true,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(BORSCHT.id);
    });

    it("non-matching tag + favoritesOnly combo returns empty", () => {
        // OMELETTE has breakfast tag but is not a favorite
        const result = filterRecipes(ALL, {
            query: "",
            tag: "breakfast",
            favoritesOnly: true,
        });
        expect(result).toHaveLength(0);
    });

    it("query + tag + favoritesOnly all applied with AND logic", () => {
        // Only BORSCHT: favorite, soup tag, ingredient "Буряк" contains "буряк"
        const result = filterRecipes(ALL, {
            query: "буряк",
            tag: "soup",
            favoritesOnly: true,
        });
        expect(result).toHaveLength(1);
        expect(result[0]?.id).toBe(BORSCHT.id);
    });

    it("query matches title but tag excludes it → empty", () => {
        // "pasta" matches Pasta Carbonara title, but tag "breakfast" excludes it
        const result = filterRecipes(ALL, {
            query: "pasta",
            tag: "breakfast",
            favoritesOnly: false,
        });
        expect(result).toHaveLength(0);
    });

    it("preserves the input order of recipes", () => {
        // "o" (Latin) matches PASTA title ("Carb-o-nara") and OMELETTE title; not Борщ
        const result = filterRecipes(ALL, {
            query: "o",
            tag: null,
            favoritesOnly: false,
        });
        const ids = result.map((r) => r.id);
        expect(ids.indexOf(PASTA.id)).toBeLessThan(ids.indexOf(OMELETTE.id));
    });
});
