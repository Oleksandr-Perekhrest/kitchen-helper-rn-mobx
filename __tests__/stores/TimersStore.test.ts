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
): string {
    return store.start({
        step: {
            recipeId: "recipe-1",
            stepId: overrides.stepId ?? STEP_ID,
        },
        kind: "boil",
        minutes: overrides.minutes ?? 20,
    });
}

// ─── start ───────────────────────────────────────────────────────────────────

describe("TimersStore.start", () => {
    it("creates a running timer for the given stepId", () => {
        const { store } = makeStore();
        const id = startTimer(store);
        expect(store.get(id)?.endsAt).toBe(NOW + 20 * 60_000);
    });

    it("does nothing if a timer already exists for that stepId", () => {
        const { store, advance } = makeStore();
        const id1 = startTimer(store);
        const originalEndsAt = store.get(id1)?.endsAt;
        advance(5000);
        const id2 = startTimer(store); // should return the existing id
        expect(id2).toBe(id1);
        expect(store.get(id1)?.endsAt).toBe(originalEndsAt);
    });

    it("allows timers for different stepIds to coexist", () => {
        const { store } = makeStore();
        const id1 = startTimer(store, { stepId: "step-1" });
        const id2 = startTimer(store, { stepId: "step-2" });
        expect(store.get(id1)).toBeDefined();
        expect(store.get(id2)).toBeDefined();
    });
});

// ─── pause ───────────────────────────────────────────────────────────────────

describe("TimersStore.pause", () => {
    it("paused timer has endsAt null", () => {
        const { store } = makeStore();
        const id = startTimer(store);
        store.pause(id);
        expect(store.get(id)?.endsAt).toBeNull();
    });

    it("stores remaining time in remainingMs", () => {
        const { store, advance } = makeStore();
        const id = startTimer(store, { minutes: 20 });
        advance(60_000);
        store.pause(id);
        expect(store.get(id)?.remainingMs).toBe(19 * 60_000);
    });

    it("unknown id is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.pause("unknown")).not.toThrow();
    });
});

// ─── resume ──────────────────────────────────────────────────────────────────

describe("TimersStore.resume", () => {
    it("paused timer is running again after resume", () => {
        const { store, advance } = makeStore();
        const id = startTimer(store);
        advance(60_000);
        store.pause(id);
        advance(5_000);
        store.resume(id);
        const timer = store.get(id);
        expect(timer?.endsAt).not.toBeNull();
    });

    it("endsAt is set to now + remainingMs", () => {
        const { store, advance } = makeStore();
        const id = startTimer(store, { minutes: 20 });
        advance(60_000); // 1 min elapsed
        store.pause(id); // 19 min left
        advance(10_000); // time passes while paused
        store.resume(id);
        const timer = store.get(id);
        // now = NOW + 70_000, remainingMs = 19 * 60_000
        expect(timer?.endsAt).toBe(NOW + 70_000 + 19 * 60_000);
    });

    it("unknown id is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.resume("unknown")).not.toThrow();
    });
});

// ─── adjust ──────────────────────────────────────────────────────────────────

describe("TimersStore.adjust", () => {
    it("adds time to a running timer", () => {
        const { store } = makeStore();
        const id = startTimer(store, { minutes: 20 });
        const before = store.get(id)?.endsAt ?? 0;
        store.adjust(id, 5);
        expect(store.get(id)?.endsAt).toBe(before + 5 * 60_000);
    });

    it("adds time to a paused timer (remainingMs only)", () => {
        const { store } = makeStore();
        const id = startTimer(store, { minutes: 20 });
        store.pause(id);
        const before = store.get(id)?.remainingMs ?? 0;
        store.adjust(id, 5);
        const timer = store.get(id);
        expect(timer?.remainingMs).toBe(before + 5 * 60_000);
        expect(timer?.endsAt).toBeNull();
    });

    it("clamps at MAX_TIMER_MS", () => {
        const { store } = makeStore();
        const id = startTimer(store, { minutes: 20 });
        store.adjust(id, 99999);
        expect(store.get(id)?.remainingMs).toBe(MAX_TIMER_MS);
    });

    it("clamps at 0", () => {
        const { store } = makeStore();
        const id = startTimer(store, { minutes: 20 });
        store.adjust(id, -99999);
        expect(store.get(id)?.remainingMs).toBe(0);
    });

    it("unknown id is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.adjust("unknown", 5)).not.toThrow();
    });
});

// ─── restart ─────────────────────────────────────────────────────────────────

describe("TimersStore.restart", () => {
    it("restores full durationMs and sets running", () => {
        const { store, advance } = makeStore();
        const id = startTimer(store, { minutes: 20 });
        advance(10 * 60_000); // 10 min elapsed
        store.pause(id);
        advance(5_000);
        store.restart(id);
        const timer = store.get(id);
        expect(timer?.remainingMs).toBe(20 * 60_000);
        expect(timer?.endsAt).not.toBeNull();
    });

    it("unknown id is a no-op", () => {
        const { store } = makeStore();
        expect(() => store.restart("unknown")).not.toThrow();
    });
});

// ─── remove ──────────────────────────────────────────────────────────────────

describe("TimersStore.remove", () => {
    it("timer is gone after remove", () => {
        const { store } = makeStore();
        const id = startTimer(store);
        store.remove(id);
        expect(store.get(id)).toBeUndefined();
    });

    it("unknown id is a no-op", () => {
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
        const id = startTimer(store);
        store.pause(id);
        expect(store.hasRunning).toBe(false);
    });

    it("true when at least one of several timers is running", () => {
        const { store } = makeStore();
        const id1 = startTimer(store, { stepId: "step-1" });
        startTimer(store, { stepId: "step-2" });
        store.pause(id1);
        expect(store.hasRunning).toBe(true);
    });

    it("false after all timers are removed", () => {
        const { store } = makeStore();
        const id = startTimer(store);
        store.remove(id);
        expect(store.hasRunning).toBe(false);
    });
});
