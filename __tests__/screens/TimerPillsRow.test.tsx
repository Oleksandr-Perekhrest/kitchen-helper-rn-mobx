// outsource dependencies
import { act, screen, render, fireEvent } from "@testing-library/react-native";
import {
    it,
    jest,
    expect,
    describe,
    afterAll,
    afterEach,
    beforeAll,
    beforeEach,
} from "@jest/globals";

// local dependencies
import { initI18n } from "../../src/i18n";
import { ThemeProvider } from "../../src/theme";
import type { Recipe } from "../../src/domain/recipe";
import { DraftStore } from "../../src/stores/DraftStore";
import { TimersStore } from "../../src/stores/TimersStore";
import type { RootStore } from "../../src/stores/RootStore";
import { RecipesStore } from "../../src/stores/RecipesStore";
import { SettingsStore } from "../../src/stores/SettingsStore";
import { SnackbarStore } from "../../src/stores/SnackbarStore";
import { StoreProvider } from "../../src/stores/StoreProvider";
import { TimerPillsRow } from "../../src/screens/cookingMode/TimerPillsRow";

const NOW = 1_700_000_000_000;

function makeRecipe(id: string, title: string, stepIds: string[]): Recipe {
    return {
        id,
        title,
        servings: 2,
        tags: [],
        favorite: false,
        ingredients: [],
        steps: stepIds.map((stepId) => ({
            id: stepId,
            text: "step",
            ingredientIds: [],
        })),
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
    };
}

function makeStore(): RootStore {
    const settings = new SettingsStore();
    const recipes = new RecipesStore();
    const draft = new DraftStore();
    const timers = new TimersStore();
    const snackbar = new SnackbarStore();
    return {
        settings,
        recipes,
        draft,
        timers,
        snackbar,
        dispose: () => snackbar.dispose(),
    };
}

type Harness = {
    store: RootStore;
    timerIds: { a1: string; a2: string; b1: string; custom: string };
};

function setupHarness(): Harness {
    const store = makeStore();
    store.recipes.replaceAll([
        makeRecipe("recipe-A", "Recipe A", ["A1", "A2"]),
        makeRecipe("recipe-B", "Recipe B", ["B1"]),
    ]);
    const a1 = store.timers.start({
        kind: "boil",
        minutes: 10,
        step: { recipeId: "recipe-A", stepId: "A1" },
    });
    const a2 = store.timers.start({
        kind: "fry",
        minutes: 10,
        step: { recipeId: "recipe-A", stepId: "A2" },
    });
    const b1 = store.timers.start({
        kind: "bake",
        minutes: 10,
        step: { recipeId: "recipe-B", stepId: "B1" },
    });
    const custom = store.timers.start({
        kind: "other",
        minutes: 10,
    });
    return { store, timerIds: { a1, a2, b1, custom } };
}

async function renderRow(harness: Harness, currentStepId = "A1") {
    const onOpenStep = jest.fn<(stepId: string, timerId: string) => void>();
    const onOpenTarget = jest.fn<(timerId: string) => void>();
    await render(
        <ThemeProvider preference="light">
            <StoreProvider store={harness.store}>
                <TimerPillsRow
                    recipeId="recipe-A"
                    currentStepId={currentStepId}
                    now={NOW}
                    horizontalPadding={16}
                    onOpenStep={onOpenStep}
                    onOpenTarget={onOpenTarget}
                />
            </StoreProvider>
        </ThemeProvider>,
    );
    return { onOpenStep, onOpenTarget };
}

async function press(name: string) {
    await act(async () => {
        fireEvent.press(screen.getByRole("button", { name }));
    });
}

beforeAll(() => {
    initI18n("en");
});

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
});

afterEach(() => {
    jest.clearAllTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe("TimerPillsRow", () => {
    it("hides the pill for the current step and shows pills for the others", async () => {
        const harness = setupHarness();
        await renderRow(harness);

        expect(
            screen.queryByRole("button", { name: "Boil: 10:00" }),
        ).not.toBeOnTheScreen();

        expect(
            screen.getByRole("button", { name: "Fry: 10:00" }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole("button", { name: "Bake: 10:00" }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole("button", { name: "Other: 10:00" }),
        ).toBeOnTheScreen();
    });

    it("first press expands the pill with its step label", async () => {
        const harness = setupHarness();
        await renderRow(harness);

        await press("Fry: 10:00");

        expect(
            screen.getByRole("button", { name: "Fry: 10:00, Step 2" }),
        ).toBeOnTheScreen();
    });

    it("second press on a same-recipe pill calls onOpenStep(stepId, timerId)", async () => {
        const harness = setupHarness();
        const { onOpenStep, onOpenTarget } = await renderRow(harness);

        await press("Fry: 10:00");
        await press("Fry: 10:00, Step 2");

        expect(onOpenStep).toHaveBeenCalledTimes(1);
        expect(onOpenStep).toHaveBeenCalledWith("A2", harness.timerIds.a2);
        expect(onOpenTarget).not.toHaveBeenCalled();
    });

    it("second press on a timer of another recipe calls onOpenTarget(timerId)", async () => {
        const harness = setupHarness();
        const { onOpenStep, onOpenTarget } = await renderRow(harness);

        await press("Bake: 10:00");
        await press("Bake: 10:00, Recipe B · step 1");

        expect(onOpenTarget).toHaveBeenCalledTimes(1);
        expect(onOpenTarget).toHaveBeenCalledWith(harness.timerIds.b1);
        expect(onOpenStep).not.toHaveBeenCalled();
    });

    it("second press on a custom timer calls onOpenTarget(timerId)", async () => {
        const harness = setupHarness();
        const { onOpenStep, onOpenTarget } = await renderRow(harness);

        await press("Other: 10:00");
        await press("Other: 10:00, Other");

        expect(onOpenTarget).toHaveBeenCalledTimes(1);
        expect(onOpenTarget).toHaveBeenCalledWith(harness.timerIds.custom);
        expect(onOpenStep).not.toHaveBeenCalled();
    });

    it("auto-collapses the expanded pill after 4000 ms", async () => {
        const harness = setupHarness();
        await renderRow(harness);

        await press("Fry: 10:00");
        expect(
            screen.getByRole("button", { name: "Fry: 10:00, Step 2" }),
        ).toBeOnTheScreen();

        await act(async () => {
            await jest.advanceTimersByTimeAsync(3999);
        });
        expect(
            screen.getByRole("button", { name: "Fry: 10:00, Step 2" }),
        ).toBeOnTheScreen();

        await act(async () => {
            await jest.advanceTimersByTimeAsync(1);
        });
        expect(
            screen.queryByRole("button", { name: "Fry: 10:00, Step 2" }),
        ).not.toBeOnTheScreen();
        expect(
            screen.getByRole("button", { name: "Fry: 10:00" }),
        ).toBeOnTheScreen();
    });

    it("expanding a different pill restarts the 4 s auto-collapse", async () => {
        const harness = setupHarness();
        await renderRow(harness);

        await press("Fry: 10:00");
        await act(async () => {
            await jest.advanceTimersByTimeAsync(3000);
        });

        await press("Bake: 10:00");
        expect(
            screen.getByRole("button", {
                name: "Bake: 10:00, Recipe B · step 1",
            }),
        ).toBeOnTheScreen();

        // After 3999 ms more, Bake would collapse only if the timer were
        // kept from the original press. Verify it is still expanded.
        await act(async () => {
            await jest.advanceTimersByTimeAsync(3999);
        });
        expect(
            screen.getByRole("button", {
                name: "Bake: 10:00, Recipe B · step 1",
            }),
        ).toBeOnTheScreen();

        await act(async () => {
            await jest.advanceTimersByTimeAsync(1);
        });
        expect(
            screen.queryByRole("button", {
                name: "Bake: 10:00, Recipe B · step 1",
            }),
        ).not.toBeOnTheScreen();
    });
});
