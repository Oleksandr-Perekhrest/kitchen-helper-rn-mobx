// outsource dependencies
import {
    it,
    jest,
    expect,
    describe,
    afterEach,
    beforeEach,
} from "@jest/globals";

// local dependencies
import { SnackbarStore } from "../../src/stores/SnackbarStore";

describe("SnackbarStore", () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("show() sets current to the new entry", () => {
        const store = new SnackbarStore();
        store.show({ message: "hello" });
        expect(store.current).not.toBeNull();
        expect(store.current?.message).toBe("hello");
    });

    it("auto-dismisses after durationMs", () => {
        const store = new SnackbarStore();
        store.show({ message: "hello", durationMs: 1000 });
        expect(store.current).not.toBeNull();
        jest.advanceTimersByTime(999);
        expect(store.current).not.toBeNull();
        jest.advanceTimersByTime(1);
        expect(store.current).toBeNull();
    });

    it("a second show() replaces the first and the first timeout does not dismiss the second", () => {
        const store = new SnackbarStore();
        store.show({ message: "first", durationMs: 1000 });
        const firstId = store.current?.id;
        jest.advanceTimersByTime(500);
        store.show({ message: "second", durationMs: 1000 });
        const secondId = store.current?.id;
        expect(secondId).not.toBe(firstId);
        expect(store.current?.message).toBe("second");
        // original 1000ms would have elapsed here — the second must still be present
        jest.advanceTimersByTime(500);
        expect(store.current?.id).toBe(secondId);
        expect(store.current?.message).toBe("second");
        // second's full duration elapses
        jest.advanceTimersByTime(500);
        expect(store.current).toBeNull();
    });

    it("runAction() calls onAction once and dismisses", () => {
        const store = new SnackbarStore();
        const onAction = jest.fn();
        store.show({ message: "undo", actionLabel: "Undo", onAction });
        store.runAction();
        expect(onAction).toHaveBeenCalledTimes(1);
        expect(store.current).toBeNull();
        // timeout should also be cleared so advancing further does nothing
        jest.advanceTimersByTime(10_000);
        expect(onAction).toHaveBeenCalledTimes(1);
    });

    it("runAction() without a current snackbar is a no-op", () => {
        const store = new SnackbarStore();
        expect(() => store.runAction()).not.toThrow();
        expect(store.current).toBeNull();
    });

    it("dismiss() clears the timeout so auto-dismiss does not run later", () => {
        const store = new SnackbarStore();
        store.show({ message: "hello", durationMs: 1000 });
        store.dismiss();
        expect(store.current).toBeNull();
        // If the timeout had not been cleared, advancing past durationMs would
        // re-run dismiss — harmless by itself, but we also assert no observable
        // side-effects by checking current remains null and a fresh show works.
        jest.advanceTimersByTime(2000);
        expect(store.current).toBeNull();
        store.show({ message: "next", durationMs: 1000 });
        expect(store.current?.message).toBe("next");
    });

    it("dispose() clears a pending timeout", () => {
        const store = new SnackbarStore();
        store.show({ message: "hello", durationMs: 1000 });
        store.dispose();
        // With the timeout cleared, current must stay set — dispose must not
        // allow the scheduled dismiss to fire later.
        jest.advanceTimersByTime(2000);
        expect(store.current?.message).toBe("hello");
    });

    it("setBottomOffset() updates the observable value", () => {
        const store = new SnackbarStore();
        expect(store.bottomOffset).toBeNull();
        store.setBottomOffset(80);
        expect(store.bottomOffset).toBe(80);
        store.setBottomOffset(null);
        expect(store.bottomOffset).toBeNull();
    });

    it("show() defaults durationMs to 5000", () => {
        const store = new SnackbarStore();
        store.show({ message: "hello" });
        jest.advanceTimersByTime(4999);
        expect(store.current).not.toBeNull();
        jest.advanceTimersByTime(1);
        expect(store.current).toBeNull();
    });
});
