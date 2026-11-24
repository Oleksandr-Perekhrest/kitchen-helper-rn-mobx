// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import type { Recipe } from "../../src/domain/recipe";
import { TimersStore } from "../../src/stores/TimersStore";
import { RecipesStore } from "../../src/stores/RecipesStore";
import { resolveOpenTarget } from "../../src/notifications/openTarget";

// ─── fixtures ────────────────────────────────────────────────────────────────

const NOW = 1_000_000;

const RECIPE: Recipe = {
    id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    title: "Soup",
    servings: 3,
    tags: ["soup"],
    favorite: false,
    ingredients: [
        {
            id: "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb",
            name: "Water",
            amount: 1,
            unit: "l",
        },
    ],
    steps: [
        {
            id: "cccccccc-cccc-4ccc-cccc-cccccccccccc",
            text: "Boil water.",
            ingredientIds: ["bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb"],
        },
    ],
    createdAt: new Date(NOW).toISOString(),
    updatedAt: new Date(NOW).toISOString(),
};

const RECIPE_ID = RECIPE.id;
const STEP_ID = RECIPE.steps[0]?.id ?? "";

function makeStores() {
    const timers = new TimersStore(() => NOW);
    const recipes = new RecipesStore();
    return { timers, recipes };
}

// ─── resolveOpenTarget ────────────────────────────────────────────────────────

describe("resolveOpenTarget", () => {
    it("step timer with existing recipe and step → CookingMode with recipe servings and stepId", () => {
        const { timers, recipes } = makeStores();
        recipes.replaceAll([RECIPE]);
        const id = timers.start({
            kind: "boil",
            minutes: 5,
            step: { recipeId: RECIPE_ID, stepId: STEP_ID },
        });

        const target = resolveOpenTarget(id, timers, recipes);
        expect(target).toEqual({
            screen: "CookingMode",
            recipeId: RECIPE_ID,
            servings: RECIPE.servings,
            stepId: STEP_ID,
        });
    });

    it("custom timer (no step) → Timers", () => {
        const { timers, recipes } = makeStores();
        const id = timers.start({ kind: "boil", minutes: 5 });

        const target = resolveOpenTarget(id, timers, recipes);
        expect(target).toEqual({ screen: "Timers" });
    });

    it("unknown timer id → Timers", () => {
        const { timers, recipes } = makeStores();
        const target = resolveOpenTarget("does-not-exist", timers, recipes);
        expect(target).toEqual({ screen: "Timers" });
    });

    it("undefined id → Timers", () => {
        const { timers, recipes } = makeStores();
        const target = resolveOpenTarget(undefined, timers, recipes);
        expect(target).toEqual({ screen: "Timers" });
    });

    it("deleted recipe → Timers", () => {
        const { timers, recipes } = makeStores();
        recipes.replaceAll([RECIPE]);
        const id = timers.start({
            kind: "boil",
            minutes: 5,
            step: { recipeId: RECIPE_ID, stepId: STEP_ID },
        });
        recipes.remove(RECIPE_ID);

        const target = resolveOpenTarget(id, timers, recipes);
        expect(target).toEqual({ screen: "Timers" });
    });

    it("deleted step (recipe exists but step removed) → Timers", () => {
        const { timers, recipes } = makeStores();
        recipes.replaceAll([RECIPE]);
        const id = timers.start({
            kind: "boil",
            minutes: 5,
            step: { recipeId: RECIPE_ID, stepId: STEP_ID },
        });
        // Replace recipe with one that has the step removed
        recipes.replaceAll([{ ...RECIPE, steps: [] }]);

        const target = resolveOpenTarget(id, timers, recipes);
        expect(target).toEqual({ screen: "Timers" });
    });
});
