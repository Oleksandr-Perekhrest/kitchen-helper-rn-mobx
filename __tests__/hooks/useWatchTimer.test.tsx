// outsource dependencies
import { AppState } from "react-native";
import type { AppStateStatus } from "react-native";
import { act, render } from "@testing-library/react-native";
import {
    it,
    jest,
    expect,
    describe,
    afterEach,
    beforeEach,
} from "@jest/globals";

// local dependencies
import { DraftStore } from "../../src/stores/DraftStore";
import { TimersStore } from "../../src/stores/TimersStore";
import type { RootStore } from "../../src/stores/RootStore";
import { RecipesStore } from "../../src/stores/RecipesStore";
import { useWatchTimer } from "../../src/hooks/useWatchTimer";
import { SettingsStore } from "../../src/stores/SettingsStore";
import { SnackbarStore } from "../../src/stores/SnackbarStore";
import { StoreProvider } from "../../src/stores/StoreProvider";
import { CookingSessionsStore } from "../../src/stores/CookingSessionsStore";

// Replace useFocusEffect with a plain useEffect so we can drive focus/blur
// through mount/unmount. The hook under test only cares about the effect
// contract (runs on focus, cleanup on blur/unmount).
jest.mock("@react-navigation/native", () => {
    const react: typeof import("react") = jest.requireActual("react");
    return {
        useFocusEffect: (cb: () => void | (() => void)) => {
            react.useEffect(() => {
                const cleanup = cb();
                return typeof cleanup === "function" ? cleanup : undefined;
            }, [cb]);
        },
    };
});

type ChangeHandler = (state: AppStateStatus) => void;

let currentAppState: AppStateStatus = "active";
let appStateHandler: ChangeHandler | null = null;

beforeEach(() => {
    currentAppState = "active";
    appStateHandler = null;

    // AppState.currentState is a jest.fn() in RN's jest preset; replace it
    // with a dynamic getter so each test can control the current state.
    Object.defineProperty(AppState, "currentState", {
        configurable: true,
        get: () => currentAppState,
    });

    jest.spyOn(AppState, "addEventListener").mockImplementation(((
        event: string,
        handler: ChangeHandler,
    ) => {
        if (event === "change") appStateHandler = handler;
        return { remove: jest.fn() };
    }) as typeof AppState.addEventListener);
});

afterEach(() => {
    jest.restoreAllMocks();
});

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
        startupCancelIds: [],
        dispose: () => snackbar.dispose(),
    };
}

function TestComponent({ timerId }: { timerId: string | undefined }) {
    useWatchTimer(timerId);
    return null;
}

async function renderWith(store: RootStore, timerId: string | undefined) {
    return render(
        <StoreProvider store={store}>
            <TestComponent timerId={timerId} />
        </StoreProvider>,
    );
}

async function fireAppState(state: AppStateStatus) {
    await act(async () => {
        currentAppState = state;
        appStateHandler?.(state);
    });
}

describe("useWatchTimer", () => {
    it("sets watchedTimerId while focused and active", async () => {
        const store = makeStore();
        await renderWith(store, "T1");
        expect(store.timers.watchedTimerId).toBe("T1");
    });

    it("clears watchedTimerId to null on 'background'", async () => {
        const store = makeStore();
        await renderWith(store, "T1");
        expect(store.timers.watchedTimerId).toBe("T1");

        await fireAppState("background");
        expect(store.timers.watchedTimerId).toBeNull();
    });

    it("clears watchedTimerId to null on 'inactive'", async () => {
        const store = makeStore();
        await renderWith(store, "T1");

        await fireAppState("inactive");
        expect(store.timers.watchedTimerId).toBeNull();
    });

    it("re-sets watchedTimerId when the app goes back to 'active'", async () => {
        const store = makeStore();
        await renderWith(store, "T1");

        await fireAppState("background");
        expect(store.timers.watchedTimerId).toBeNull();

        await fireAppState("active");
        expect(store.timers.watchedTimerId).toBe("T1");
    });

    it("unmount clears watchedTimerId when the hook still owns it", async () => {
        const store = makeStore();
        const { unmount } = await renderWith(store, "T1");
        expect(store.timers.watchedTimerId).toBe("T1");

        await unmount();
        expect(store.timers.watchedTimerId).toBeNull();
    });

    it("unmount leaves watchedTimerId unchanged when another owner has replaced it", async () => {
        const store = makeStore();
        const { unmount } = await renderWith(store, "T1");
        expect(store.timers.watchedTimerId).toBe("T1");

        await act(() => {
            store.timers.setWatchedTimerId("T2");
        });
        expect(store.timers.watchedTimerId).toBe("T2");

        await unmount();
        expect(store.timers.watchedTimerId).toBe("T2");
    });
});
