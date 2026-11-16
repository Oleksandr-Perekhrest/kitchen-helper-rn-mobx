// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { getDemoRecipes } from "../../src/data/demoRecipes";
import { TAGS, UNITS, RecipeSchema } from "../../src/domain/recipe";

const NOW = new Date("2026-11-16T10:00:00.000Z");

describe("getDemoRecipes", () => {
    describe("schema validity", () => {
        it('every "en" recipe passes RecipeSchema', () => {
            const recipes = getDemoRecipes("en", NOW);
            const failures = recipes
                .map((r) => ({ r, result: RecipeSchema.safeParse(r) }))
                .filter(({ result }) => !result.success)
                .map(
                    ({ r, result }) =>
                        `"${r.title}" (${r.id}): ${JSON.stringify(result.error?.issues)}`,
                );
            expect(failures).toEqual([]);
        });

        it('every "uk" recipe passes RecipeSchema', () => {
            const recipes = getDemoRecipes("uk", NOW);
            const failures = recipes
                .map((r) => ({ r, result: RecipeSchema.safeParse(r) }))
                .filter(({ result }) => !result.success)
                .map(
                    ({ r, result }) =>
                        `"${r.title}" (${r.id}): ${JSON.stringify(result.error?.issues)}`,
                );
            expect(failures).toEqual([]);
        });
    });

    describe("structural consistency between languages", () => {
        it("both languages have the same recipe ids in the same order", () => {
            const enIds = getDemoRecipes("en", NOW).map((r) => r.id);
            const ukIds = getDemoRecipes("uk", NOW).map((r) => r.id);
            expect(ukIds).toEqual(enIds);
        });

        it("both languages have the same ingredient ids per recipe in the same order", () => {
            const en = getDemoRecipes("en", NOW);
            const uk = getDemoRecipes("uk", NOW);
            const enAll = en.map((r) => r.ingredients.map((ing) => ing.id));
            const ukAll = uk.map((r) => r.ingredients.map((ing) => ing.id));
            expect(ukAll).toEqual(enAll);
        });

        it("both languages have the same step ids per recipe in the same order", () => {
            const en = getDemoRecipes("en", NOW);
            const uk = getDemoRecipes("uk", NOW);
            const enAll = en.map((r) => r.steps.map((s) => s.id));
            const ukAll = uk.map((r) => r.steps.map((s) => s.id));
            expect(ukAll).toEqual(enAll);
        });
    });

    describe("coverage of UNITS and TAGS", () => {
        it("every unit from UNITS is used at least once across the five recipes", () => {
            const recipes = getDemoRecipes("en", NOW);
            const usedUnits = new Set(
                recipes.flatMap((r) => r.ingredients.map((i) => i.unit)),
            );
            const missingUnits = UNITS.filter((u) => !usedUnits.has(u));
            expect(missingUnits).toEqual([]);
        });

        it("every tag from TAGS is used at least once across the five recipes", () => {
            const recipes = getDemoRecipes("en", NOW);
            const usedTags = new Set(recipes.flatMap((r) => r.tags));
            const missingTags = TAGS.filter((t) => !usedTags.has(t));
            expect(missingTags).toEqual([]);
        });
    });
});
