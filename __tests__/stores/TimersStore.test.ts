// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { MAX_TIMER_MS } from "../../src/domain/timer";
import { TimersStore } from "../../src/stores/TimersStore";

// ─── fixtures ────────────────────────────────────────────────────────────────

const NOW = 1_000_000;
const STEP_ID = "step-1";

function makeStore(now = NOW) {
    let time = now;
    const clock = () => time;
    const store = new TimersStore(clock);
    const advance = (ms: number) => {
        time += ms;
    };
    return { store, clock, advance };
}

function startTimer(
    store: TimersStore,
    overrides: Partial<{ minutes: number; stepId: string }> = {},
) {
    store.start({
        recipeId: "recipe-1",
        stepId: overrides.stepId ?? STEP_ID,
        kind: "boil",
        minutes: overrides.minutes ?? 20,
    });
}

// ─── start ───────────────────────────────────────────────────────────────────

describe("TimersStore.start", () => {
    it("creates a running timer for the given stepId", () => {
        const { store } = makeStore();
        startTimer(store);
        expect(store.get(STEP_ID)?.endsAt).toBe(NOW + 20 * 60_000);
    });

    it("does nothing if a timer already exists for that stepId", () => {
        const { store, advance } = makeStore();
        startTimer(store);
        const originalEndsAt = store.get(STEP_ID)?.endsAt;
        advance(5000);
        startTimer(store); // should be a no-op
        expect(store.get(STEP_ID)?.endsAt).toBe(originalEndsAt);
    });

    it("allows timers for different stepIds to coexist", () => {
        const { store } = makeStore();
        startTimer(store, { stepId: "step-1" });
        startTimer(store, { stepId: "step-2" });
        expect(store.get("step-1")).toBeDefined();
        expect(store.get("step-2")).toBeDefined();
    });
});

// ─── pause ───────────────────────────────────────────────────────────────────

describe("TimersStore.pause", () => {
    it("paused timer has endsAt null", () => {
        const { store } = makeStore();
        startTimer(store);
        store.pause(STEP_ID);
        expect(store.get(STEP_ID)?.endsAt).toBeNull();
    });

    it("stores remaining time in remainingMs", () => {
        const { store, advance } = makeStore();
        startTimer(store, { minutes: 20 });
        advance(60_000);
        store.pause(STEP_ID);
        expect(store.get(STEP_ID)?.remainingMs).toBe(19 * 60_000);
    });

    it("unknown stepId is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.pause("unknown")).not.toThrow();
    });
});

// ─── resume ──────────────────────────────────────────────────────────────────

describe("TimersStore.resume", () => {
    it("paused timer is running again after resume", () => {
        const { store, advance } = makeStore();
        startTimer(store);
        advance(60_000);
        store.pause(STEP_ID);
        advance(5_000);
        store.resume(STEP_ID);
        const timer = store.get(STEP_ID);
        expect(timer?.endsAt).not.toBeNull();
    });

    it("endsAt is set to now + remainingMs", () => {
        const { store, advance } = makeStore();
        startTimer(store, { minutes: 20 });
        advance(60_000); // 1 min elapsed
        store.pause(STEP_ID); // 19 min left
        advance(10_000); // time passes while paused
        store.resume(STEP_ID);
        const timer = store.get(STEP_ID);
        // now = NOW + 70_000, remainingMs = 19 * 60_000
        expect(timer?.endsAt).toBe(NOW + 70_000 + 19 * 60_000);
    });

    it("unknown stepId is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.resume("unknown")).not.toThrow();
    });
});

// ─── adjust ──────────────────────────────────────────────────────────────────

describe("TimersStore.adjust", () => {
    it("adds time to a running timer", () => {
        const { store } = makeStore();
        startTimer(store, { minutes: 20 });
        const before = store.get(STEP_ID)?.endsAt ?? 0;
        store.adjust(STEP_ID, 5);
        expect(store.get(STEP_ID)?.endsAt).toBe(before + 5 * 60_000);
    });

    it("adds time to a paused timer (remainingMs only)", () => {
        const { store } = makeStore();
        startTimer(store, { minutes: 20 });
        store.pause(STEP_ID);
        const before = store.get(STEP_ID)?.remainingMs ?? 0;
        store.adjust(STEP_ID, 5);
        const timer = store.get(STEP_ID);
        expect(timer?.remainingMs).toBe(before + 5 * 60_000);
        expect(timer?.endsAt).toBeNull();
    });

    it("clamps at MAX_TIMER_MS", () => {
        const { store } = makeStore();
        startTimer(store, { minutes: 20 });
        store.adjust(STEP_ID, 99999);
        expect(store.get(STEP_ID)?.remainingMs).toBe(MAX_TIMER_MS);
    });

    it("clamps at 0", () => {
        const { store } = makeStore();
        startTimer(store, { minutes: 20 });
        store.adjust(STEP_ID, -99999);
        expect(store.get(STEP_ID)?.remainingMs).toBe(0);
    });

    it("unknown stepId is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.adjust("unknown", 5)).not.toThrow();
    });
});

// ─── restart ─────────────────────────────────────────────────────────────────

describe("TimersStore.restart", () => {
    it("restores full durationMs and sets running", () => {
        const { store, advance } = makeStore();
        startTimer(store, { minutes: 20 });
        advance(10 * 60_000); // 10 min elapsed
        store.pause(STEP_ID);
        advance(5_000);
        store.restart(STEP_ID);
        const timer = store.get(STEP_ID);
        expect(timer?.remainingMs).toBe(20 * 60_000);
        expect(timer?.endsAt).not.toBeNull();
    });

    it("unknown stepId is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.restart("unknown")).not.toThrow();
    });
});

// ─── remove ──────────────────────────────────────────────────────────────────

describe("TimersStore.remove", () => {
    it("timer is gone after remove", () => {
        const { store } = makeStore();
        startTimer(store);
        store.remove(STEP_ID);
        expect(store.get(STEP_ID)).toBeUndefined();
    });

    it("unknown stepId is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.remove("unknown")).not.toThrow();
    });
});

// ─── hasRunning ──────────────────────────────────────────────────────────────

describe("TimersStore.hasRunning", () => {
    it("false when no timers exist", () => {
        const { store } = makeStore();
        expect(store.hasRunning).toBe(false);
    });

    it("true when a running timer exists", () => {
        const { store } = makeStore();
        startTimer(store);
        expect(store.hasRunning).toBe(true);
    });

    it("false when all timers are paused", () => {
        const { store } = makeStore();
        startTimer(store);
        store.pause(STEP_ID);
        expect(store.hasRunning).toBe(false);
    });

    it("true when at least one of several timers is running", () => {
        const { store } = makeStore();
        startTimer(store, { stepId: "step-1" });
        startTimer(store, { stepId: "step-2" });
        store.pause("step-1");
        expect(store.hasRunning).toBe(true);
    });

    it("false after all timers are removed", () => {
        const { store } = makeStore();
        startTimer(store);
        store.remove(STEP_ID);
        expect(store.hasRunning).toBe(false);
    });
});
