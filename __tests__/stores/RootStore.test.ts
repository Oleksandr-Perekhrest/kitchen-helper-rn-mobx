// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import type { Recipe } from "../../src/domain/recipe";
import { createRootStore } from "../../src/stores/RootStore";
import { RECIPE_SCHEMA_VERSION } from "../../src/domain/recipe";
import { RECIPES_STORAGE_KEY } from "../../src/stores/RecipesStore";
import { createMemoryStorage } from "../../src/storage/memoryStorage";
import {
    TIMERS_VERSION,
    TIMERS_STORAGE_KEY,
} from "../../src/stores/TimersStore";
import {
    SETTINGS_VERSION,
    SETTINGS_STORAGE_KEY,
} from "../../src/stores/SettingsStore";
import {
    COOKING_SESSIONS_VERSION,
    COOKING_SESSIONS_STORAGE_KEY,
} from "../../src/stores/CookingSessionsStore";

const TIMER_NOW = 2_000_000;

// ─── shared fixtures ──────────────────────────────────────────────────────────

const NOW = new Date("2026-11-16T10:00:00.000Z");
const NOW_FN = () => NOW;

const NEW_RECIPE: Recipe = {
    id: "bbbb0001-0001-4001-b001-000000000001",
    title: "Test Soup",
    servings: 2,
    tags: ["soup"],
    favorite: false,
    ingredients: [
        {
            id: "bbbb0001-0001-4001-b001-000000000002",
            name: "Water",
            amount: 1,
            unit: "l",
        },
    ],
    steps: [
        {
            id: "bbbb0001-0001-4001-b001-000000000003",
            text: "Boil the water.",
            ingredientIds: ["bbbb0001-0001-4001-b001-000000000002"],
        },
    ],
    createdAt: NOW.toISOString(),
    updatedAt: NOW.toISOString(),
};

// ─── tests ────────────────────────────────────────────────────────────────────

describe("createRootStore", () => {
    describe("first-launch seeding", () => {
        it('seeds 5 demo recipes with Ukrainian title when deviceLanguages is ["uk"]', () => {
            const storage = createMemoryStorage();
            const store = createRootStore(storage, {
                deviceLanguages: ["uk"],
                now: NOW_FN,
            });
            expect(store.recipes.recipes).toHaveLength(5);
            expect(store.recipes.recipes[0]?.title).toBe("Борщ");
            store.dispose();
        });

        it('seeds 5 demo recipes with English title when deviceLanguages is ["en"]', () => {
            const storage = createMemoryStorage();
            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store.recipes.recipes).toHaveLength(5);
            expect(store.recipes.recipes[0]?.title).toBe("Borscht");
            store.dispose();
        });

        it('stored settings.language "en" wins over deviceLanguages ["uk"] for seeding', () => {
            const settingsEnvelope = JSON.stringify({
                version: SETTINGS_VERSION,
                data: {
                    themePreference: "system",
                    language: "en",
                    voiceEnabled: true,
                },
            });
            const storage = createMemoryStorage({
                [SETTINGS_STORAGE_KEY]: settingsEnvelope,
            });
            const store = createRootStore(storage, {
                deviceLanguages: ["uk"],
                now: NOW_FN,
            });
            expect(store.recipes.recipes[0]?.title).toBe("Borscht");
            store.dispose();
        });
    });

    describe("restart behaviour", () => {
        it("restart over the same storage: still 5 recipes, no duplicates", () => {
            const storage = createMemoryStorage();
            const store1 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store1.recipes.recipes).toHaveLength(5);
            store1.dispose();

            const store2 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store2.recipes.recipes).toHaveLength(5);
            store2.dispose();
        });

        it("stored empty recipes array: 0 recipes, no seeding", () => {
            const recipesEnvelope = JSON.stringify({
                version: RECIPE_SCHEMA_VERSION,
                data: [],
            });
            const storage = createMemoryStorage({
                [RECIPES_STORAGE_KEY]: recipesEnvelope,
            });
            const store = createRootStore(storage, {
                deviceLanguages: ["uk"],
                now: NOW_FN,
            });
            expect(store.recipes.recipes).toHaveLength(0);
            store.dispose();
        });

        it("corrupt stored recipes JSON: 0 recipes, no seeding, no throw", () => {
            const storage = createMemoryStorage({
                [RECIPES_STORAGE_KEY]: "not{valid}json{{",
            });
            const store = createRootStore(storage, {
                deviceLanguages: ["uk"],
                now: NOW_FN,
            });
            expect(store.recipes.recipes).toHaveLength(0);
            store.dispose();
        });
    });

    describe("regression: add and update persist across restart", () => {
        it("added recipe and updated title survive a restart", () => {
            const storage = createMemoryStorage();
            const store1 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });

            const demoRecipe = store1.recipes.recipes[0];
            if (demoRecipe === undefined)
                throw new Error("no demo recipes seeded");

            store1.recipes.add(NEW_RECIPE);
            store1.recipes.update({
                ...demoRecipe,
                title: "My Updated Borscht",
            });
            store1.dispose();

            const store2 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store2.recipes.recipes).toHaveLength(6);

            const addedRecipe = store2.recipes.recipes.find(
                (r) => r.id === NEW_RECIPE.id,
            );
            expect(addedRecipe?.title).toBe("Test Soup");

            const updatedDemo = store2.recipes.recipes.find(
                (r) => r.id === demoRecipe.id,
            );
            expect(updatedDemo?.title).toBe("My Updated Borscht");

            store2.dispose();
        });
    });

    describe("timer persistence", () => {
        it("started timer is saved and restored by a new RootStore on the same storage", () => {
            const storage = createMemoryStorage();
            const store1 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });

            const timerId = store1.timers.start({
                kind: "boil",
                minutes: 10,
            });
            const originalEndsAt = store1.timers.get(timerId)?.endsAt;
            store1.dispose();

            const store2 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            const restored = store2.timers.get(timerId);
            expect(restored).toBeDefined();
            expect(restored?.endsAt).toBe(originalEndsAt);
            store2.dispose();
        });

        it("watchedTimerId is not persisted across restart", () => {
            const storage = createMemoryStorage();
            const store1 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            const timerId = store1.timers.start({
                kind: "boil",
                minutes: 10,
            });
            store1.timers.setWatchedTimerId(timerId);
            store1.dispose();

            const store2 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store2.timers.watchedTimerId).toBeNull();
            store2.dispose();
        });

        it("finished timer (endsAt in the past) is kept by design", () => {
            const storage = createMemoryStorage();
            const store1 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });

            const finishedTimer = {
                id: "cccccccc-cccc-4ccc-accc-cccccccccccc",
                kind: "boil" as const,
                createdAt: TIMER_NOW,
                durationMs: 60_000,
                endsAt: TIMER_NOW - 1,
                remainingMs: 60_000,
            };
            store1.timers.replaceAll([finishedTimer]);
            store1.dispose();

            const store2 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store2.timers.get(finishedTimer.id)).toBeDefined();
            store2.dispose();
        });
    });

    describe("cooking session persistence", () => {
        it("session persists and loads across createRootStore instances", () => {
            const storage = createMemoryStorage();
            const store1 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });

            const recipe = store1.recipes.recipes[0];
            if (recipe === undefined) throw new Error("no demo recipes seeded");
            const stepId = recipe.steps[0]?.id;
            if (stepId === undefined) throw new Error("recipe has no steps");

            store1.cookingSessions.save(recipe.id, stepId, 2);
            store1.dispose();

            const store2 = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            const session = store2.cookingSessions.get(recipe.id);
            expect(session).toBeDefined();
            expect(session?.stepId).toBe(stepId);
            store2.dispose();
        });

        it("deleting a recipe removes its session via the pruning reaction", () => {
            const storage = createMemoryStorage();
            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });

            const recipe = store.recipes.recipes[0];
            if (recipe === undefined) throw new Error("no demo recipes seeded");
            const stepId = recipe.steps[0]?.id;
            if (stepId === undefined) throw new Error("recipe has no steps");

            store.cookingSessions.save(recipe.id, stepId, 2);
            expect(store.cookingSessions.get(recipe.id)).toBeDefined();

            store.recipes.remove(recipe.id);
            expect(store.cookingSessions.get(recipe.id)).toBeUndefined();

            store.dispose();
        });

        it("a session for a non-existent recipe is pruned at startup", () => {
            const orphanSession = {
                recipeId: "ghost-recipe-id",
                stepId: "ghost-step-id",
                servings: 2,
                updatedAt: "2026-01-01T00:00:00.000Z",
            };
            const storage = createMemoryStorage({
                [RECIPES_STORAGE_KEY]: JSON.stringify({
                    version: RECIPE_SCHEMA_VERSION,
                    data: [],
                }),
                [COOKING_SESSIONS_STORAGE_KEY]: JSON.stringify({
                    version: COOKING_SESSIONS_VERSION,
                    data: [orphanSession],
                }),
            });

            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(
                store.cookingSessions.get("ghost-recipe-id"),
            ).toBeUndefined();
            store.dispose();
        });
    });

    describe("timer pruning", () => {
        const ORPHAN_TIMER = {
            id: "dddddddd-dddd-4ddd-addd-dddddddddddd",
            kind: "boil",
            createdAt: TIMER_NOW,
            durationMs: 60_000,
            endsAt: TIMER_NOW + 60_000,
            remainingMs: 60_000,
            step: {
                recipeId: "99999999-9999-4999-b999-999999999999",
                stepId: "88888888-8888-4888-a888-888888888888",
            },
        };

        const FREE_TIMER = {
            id: "eeeeeeee-eeee-4eee-aeee-eeeeeeeeeeee",
            kind: "other",
            createdAt: TIMER_NOW,
            durationMs: 60_000,
            endsAt: TIMER_NOW + 60_000,
            remainingMs: 60_000,
        };

        it("deleting a recipe removes its step timers via the pruning reaction", () => {
            const storage = createMemoryStorage();
            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });

            const recipe = store.recipes.recipes[0];
            if (recipe === undefined) throw new Error("no demo recipes seeded");

            const timerId = store.timers.start({
                kind: "boil",
                minutes: 5,
                step: { recipeId: recipe.id, stepId: "step-1" },
            });
            expect(store.timers.get(timerId)).toBeDefined();

            store.recipes.remove(recipe.id);
            expect(store.timers.get(timerId)).toBeUndefined();

            store.dispose();
        });

        it("a persisted step timer for a non-existent recipe is pruned at startup", () => {
            const storage = createMemoryStorage({
                [RECIPES_STORAGE_KEY]: JSON.stringify({
                    version: RECIPE_SCHEMA_VERSION,
                    data: [],
                }),
                [TIMERS_STORAGE_KEY]: JSON.stringify({
                    version: TIMERS_VERSION,
                    data: [ORPHAN_TIMER],
                }),
            });

            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store.timers.get(ORPHAN_TIMER.id)).toBeUndefined();
            store.dispose();
        });

        it("free timers survive recipe deletion", () => {
            const storage = createMemoryStorage();
            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });

            const recipe = store.recipes.recipes[0];
            if (recipe === undefined) throw new Error("no demo recipes seeded");

            const freeId = store.timers.start({ kind: "other", minutes: 5 });
            store.recipes.remove(recipe.id);
            expect(store.timers.get(freeId)).toBeDefined();

            store.dispose();
        });

        it("free timers survive startup even when no recipes exist", () => {
            const storage = createMemoryStorage({
                [RECIPES_STORAGE_KEY]: JSON.stringify({
                    version: RECIPE_SCHEMA_VERSION,
                    data: [],
                }),
                [TIMERS_STORAGE_KEY]: JSON.stringify({
                    version: TIMERS_VERSION,
                    data: [FREE_TIMER],
                }),
            });

            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store.timers.get(FREE_TIMER.id)).toBeDefined();
            store.dispose();
        });

        it("startupCancelIds contains the IDs of timers pruned at startup", () => {
            const storage = createMemoryStorage({
                [RECIPES_STORAGE_KEY]: JSON.stringify({
                    version: RECIPE_SCHEMA_VERSION,
                    data: [],
                }),
                [TIMERS_STORAGE_KEY]: JSON.stringify({
                    version: TIMERS_VERSION,
                    data: [ORPHAN_TIMER],
                }),
            });

            const store = createRootStore(storage, {
                deviceLanguages: ["en"],
                now: NOW_FN,
            });
            expect(store.startupCancelIds).toContain(ORPHAN_TIMER.id);
            store.dispose();
        });
    });
});
