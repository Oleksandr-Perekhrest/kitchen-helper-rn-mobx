// outsource dependencies
import type { ComponentProps } from "react";
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
import { DraftStore } from "../../src/stores/DraftStore";
import { TimersStore } from "../../src/stores/TimersStore";
import type { RootStore } from "../../src/stores/RootStore";
import { RecipesStore } from "../../src/stores/RecipesStore";
import { TimersScreen } from "../../src/screens/TimersScreen";
import { SettingsStore } from "../../src/stores/SettingsStore";
import { SnackbarStore } from "../../src/stores/SnackbarStore";
import { StoreProvider } from "../../src/stores/StoreProvider";
import { SnackbarHost } from "../../src/components/SnackbarHost";
import { CookingSessionsStore } from "../../src/stores/CookingSessionsStore";

type Props = ComponentProps<typeof TimersScreen>;

function makeStore(): RootStore {
    const settings = new SettingsStore();
    const recipes = new RecipesStore();
    const draft = new DraftStore();
    const timers = new TimersStore();
    const snackbar = new SnackbarStore();
    const cookingSessions = new CookingSessionsStore();
    return {
        settings,
        recipes,
        draft,
        timers,
        snackbar,
        cookingSessions,
        dispose: () => snackbar.dispose(),
    };
}

function makeNavigation(): Props["navigation"] {
    return {
        navigate: jest.fn(),
    } as unknown as Props["navigation"];
}

function makeRoute(): Props["route"] {
    return {
        key: "Timers",
        name: "Timers",
    } as unknown as Props["route"];
}

async function renderScreen(store: RootStore) {
    const navigation = makeNavigation();
    const route = makeRoute();
    await render(
        <ThemeProvider preference="light">
            <StoreProvider store={store}>
                <TimersScreen navigation={navigation} route={route} />
                <SnackbarHost />
            </StoreProvider>
        </ThemeProvider>,
    );
    return { navigation };
}

async function press(name: string) {
    await act(async () => {
        fireEvent.press(screen.getByRole("button", { name }));
    });
}

async function typeInto(labelText: string, value: string) {
    await act(async () => {
        fireEvent.changeText(screen.getByLabelText(labelText), value);
    });
}

beforeAll(() => {
    initI18n("en");
});

beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(1_700_000_000_000);
});

afterEach(() => {
    jest.clearAllTimers();
});

afterAll(() => {
    jest.useRealTimers();
});

describe("TimersScreen empty and active count", () => {
    it("shows the empty state when there are no timers", async () => {
        const store = makeStore();
        await renderScreen(store);

        expect(screen.getByText("No timers yet")).toBeOnTheScreen();
        expect(
            screen.getByText(
                "Start a timer from a recipe step or set your own one here.",
            ),
        ).toBeOnTheScreen();
    });

    it("shows a caption with the active count, excluding finished timers", async () => {
        const store = makeStore();
        store.timers.start({ kind: "boil", minutes: 10 });
        store.timers.start({ kind: "fry", minutes: 10 });
        const doneId = store.timers.start({ kind: "bake", minutes: 10 });
        const done = store.timers.get(doneId);
        if (done === undefined) throw new Error("expected timer");
        store.timers.replaceAll([
            ...store.timers.list.filter((t) => t.id !== doneId),
            { ...done, endsAt: null, remainingMs: 0 },
        ]);

        await renderScreen(store);

        expect(screen.getByText("2 active")).toBeOnTheScreen();
    });
});

describe("TimersScreen delete + undo", () => {
    it("removes the timer and shows an undo snackbar; pressing undo restores it", async () => {
        const store = makeStore();
        store.timers.start({ kind: "boil", minutes: 10, label: "Pasta" });
        const timerId = store.timers.list[0]?.id;
        if (timerId === undefined) throw new Error("expected timer id");

        await renderScreen(store);

        expect(screen.getByText("Pasta")).toBeOnTheScreen();

        await press("Delete timer");

        expect(store.timers.get(timerId)).toBeUndefined();
        expect(screen.queryByText("Pasta")).not.toBeOnTheScreen();
        expect(screen.getByText("Timer deleted")).toBeOnTheScreen();

        await press("Undo");

        expect(store.timers.get(timerId)?.id).toBe(timerId);
        expect(screen.getByText("Pasta")).toBeOnTheScreen();
    });
});

describe("TimersScreen NewTimerForm", () => {
    it("starts a timer with the default 10 min, kind 'other', undefined label", async () => {
        const store = makeStore();
        await renderScreen(store);

        await press("Start · 10 min");

        expect(store.timers.list).toHaveLength(1);
        const timer = store.timers.list[0];
        if (timer === undefined) throw new Error("expected timer");
        expect(timer.durationMs).toBe(600_000);
        expect(timer.kind).toBe("other");
        expect(timer.label).toBeUndefined();
    });

    it("trims the name and uses it as the label", async () => {
        const store = makeStore();
        await renderScreen(store);

        await typeInto("Timer name", "  Яйця  ");
        await press("Start · 10 min");

        const timer = store.timers.list[0];
        if (timer === undefined) throw new Error("expected timer");
        expect(timer.label).toBe("Яйця");
    });

    it("leaves the label undefined when the name field is empty", async () => {
        const store = makeStore();
        await renderScreen(store);

        await press("Start · 10 min");

        const timer = store.timers.list[0];
        if (timer === undefined) throw new Error("expected timer");
        expect(timer.label).toBeUndefined();
    });

    it("clears the name field after starting", async () => {
        const store = makeStore();
        await renderScreen(store);

        await typeInto("Timer name", "Pasta");
        await press("Start · 10 min");

        expect(screen.getByLabelText("Timer name").props.value).toBe("");
    });
});
