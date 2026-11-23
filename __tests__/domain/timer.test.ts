// outsource dependencies
import { it, expect, describe } from "@jest/globals";

// local dependencies
import { MAX_TIMER_MS } from "../../src/domain/timer";
import {
    isDone,
    isRunning,
    pauseTimer,
    createTimer,
    resumeTimer,
    adjustTimer,
    restartTimer,
    getRemainingMs,
    formatRemaining,
} from "../../src/domain/timer";

// ─── fixtures ────────────────────────────────────────────────────────────────

const NOW = 1_000_000;
const MINUTES = 20;
const DURATION_MS = MINUTES * 60_000;

const RUNNING = createTimer(
    { step: { recipeId: "r1", stepId: "s1" }, kind: "boil", minutes: MINUTES },
    NOW,
    "timer-1",
);

const PAUSED = {
    ...RUNNING,
    endsAt: null,
    remainingMs: 5 * 60_000,
};

const DONE_RUNNING = { ...RUNNING, endsAt: NOW - 1 };

// ─── createTimer ─────────────────────────────────────────────────────────────

describe("createTimer", () => {
    it("sets durationMs from minutes", () => {
        expect(RUNNING.durationMs).toBe(DURATION_MS);
    });

    it("sets endsAt = now + durationMs", () => {
        expect(RUNNING.endsAt).toBe(NOW + DURATION_MS);
    });

    it("sets remainingMs = durationMs", () => {
        expect(RUNNING.remainingMs).toBe(DURATION_MS);
    });

    it("copies id, step, kind", () => {
        expect(RUNNING.id).toBe("timer-1");
        expect(RUNNING.step?.recipeId).toBe("r1");
        expect(RUNNING.step?.stepId).toBe("s1");
        expect(RUNNING.kind).toBe("boil");
    });
});

// ─── getRemainingMs ───────────────────────────────────────────────────────────

describe("getRemainingMs", () => {
    it("running: returns endsAt - now", () => {
        expect(getRemainingMs(RUNNING, NOW + 60_000)).toBe(
            DURATION_MS - 60_000,
        );
    });

    it("running: clamps to 0 when past endsAt", () => {
        expect(getRemainingMs(RUNNING, NOW + DURATION_MS + 1)).toBe(0);
    });

    it("paused: returns remainingMs regardless of now", () => {
        expect(getRemainingMs(PAUSED, NOW + 999_999)).toBe(5 * 60_000);
    });
});

// ─── isRunning ────────────────────────────────────────────────────────────────

describe("isRunning", () => {
    it("true when endsAt !== null", () => {
        expect(isRunning(RUNNING)).toBe(true);
    });

    it("false when endsAt is null", () => {
        expect(isRunning(PAUSED)).toBe(false);
    });
});

// ─── isDone ──────────────────────────────────────────────────────────────────

describe("isDone", () => {
    it("false when timer has remaining time", () => {
        expect(isDone(RUNNING, NOW)).toBe(false);
    });

    it("true when running timer has elapsed", () => {
        expect(isDone(DONE_RUNNING, NOW)).toBe(true);
    });

    it("true when paused with remainingMs = 0", () => {
        const exhausted = { ...PAUSED, remainingMs: 0 };
        expect(isDone(exhausted, NOW)).toBe(true);
    });
});

// ─── pauseTimer ──────────────────────────────────────────────────────────────

describe("pauseTimer", () => {
    it("sets endsAt to null", () => {
        const paused = pauseTimer(RUNNING, NOW + 60_000);
        expect(paused.endsAt).toBeNull();
    });

    it("stores remaining time in remainingMs", () => {
        const paused = pauseTimer(RUNNING, NOW + 60_000);
        expect(paused.remainingMs).toBe(DURATION_MS - 60_000);
    });

    it("does not mutate the original timer", () => {
        const before = RUNNING.endsAt;
        pauseTimer(RUNNING, NOW);
        expect(RUNNING.endsAt).toBe(before);
    });

    it("already paused: returns the same object unchanged", () => {
        const result = pauseTimer(PAUSED, NOW);
        expect(result).toBe(PAUSED);
    });
});

// ─── resumeTimer ─────────────────────────────────────────────────────────────

describe("resumeTimer", () => {
    it("paused with remainingMs > 0: sets endsAt = now + remainingMs", () => {
        const resumed = resumeTimer(PAUSED, NOW);
        expect(resumed.endsAt).toBe(NOW + PAUSED.remainingMs);
    });

    it("paused with remainingMs = 0: returns unchanged", () => {
        const exhausted = { ...PAUSED, remainingMs: 0 };
        expect(resumeTimer(exhausted, NOW)).toBe(exhausted);
    });

    it("already running: returns unchanged", () => {
        expect(resumeTimer(RUNNING, NOW)).toBe(RUNNING);
    });
});

// ─── adjustTimer ─────────────────────────────────────────────────────────────

describe("adjustTimer", () => {
    it("running: adds delta and updates endsAt", () => {
        const adjusted = adjustTimer(RUNNING, 5, NOW);
        expect(adjusted.endsAt).toBe(NOW + DURATION_MS + 5 * 60_000);
        expect(adjusted.remainingMs).toBe(DURATION_MS + 5 * 60_000);
    });

    it("running: subtracting delta updates endsAt", () => {
        const adjusted = adjustTimer(RUNNING, -5, NOW);
        expect(adjusted.endsAt).toBe(NOW + DURATION_MS - 5 * 60_000);
    });

    it("paused: updates remainingMs only", () => {
        const adjusted = adjustTimer(PAUSED, 2, NOW);
        expect(adjusted.remainingMs).toBe(PAUSED.remainingMs + 2 * 60_000);
        expect(adjusted.endsAt).toBeNull();
    });

    it("clamps at 0 (cannot go negative)", () => {
        const adjusted = adjustTimer(PAUSED, -999, NOW);
        expect(adjusted.remainingMs).toBe(0);
    });

    it("clamps at MAX_TIMER_MS", () => {
        const adjusted = adjustTimer(PAUSED, 99999, NOW);
        expect(adjusted.remainingMs).toBe(MAX_TIMER_MS);
    });

    it("does not mutate the original timer", () => {
        const before = PAUSED.remainingMs;
        adjustTimer(PAUSED, 5, NOW);
        expect(PAUSED.remainingMs).toBe(before);
    });
});

// ─── restartTimer ─────────────────────────────────────────────────────────────

describe("restartTimer", () => {
    it("resets remainingMs to durationMs", () => {
        const restarted = restartTimer(PAUSED, NOW);
        expect(restarted.remainingMs).toBe(PAUSED.durationMs);
    });

    it("sets endsAt = now + durationMs", () => {
        const restarted = restartTimer(PAUSED, NOW);
        expect(restarted.endsAt).toBe(NOW + PAUSED.durationMs);
    });

    it("also works when already running", () => {
        const later = NOW + 30_000;
        const restarted = restartTimer(RUNNING, later);
        expect(restarted.endsAt).toBe(later + RUNNING.durationMs);
    });
});

// ─── formatRemaining ─────────────────────────────────────────────────────────

describe("formatRemaining", () => {
    it('"0:00" for 0 ms', () => {
        expect(formatRemaining(0)).toBe("0:00");
    });

    it('"0:00" for negative input', () => {
        expect(formatRemaining(-1000)).toBe("0:00");
    });

    it('"0:01" for 1 ms (rounds up)', () => {
        expect(formatRemaining(1)).toBe("0:01");
    });

    it('"0:01" for 500 ms (rounds up to 1 second)', () => {
        expect(formatRemaining(500)).toBe("0:01");
    });

    it('"0:01" for exactly 1000 ms', () => {
        expect(formatRemaining(1000)).toBe("0:01");
    });

    it('"0:59" for 59 seconds', () => {
        expect(formatRemaining(59 * 1000)).toBe("0:59");
    });

    it('"1:00" for 60 seconds', () => {
        expect(formatRemaining(60 * 1000)).toBe("1:00");
    });

    it('"20:00" for 20 minutes', () => {
        expect(formatRemaining(20 * 60 * 1000)).toBe("20:00");
    });

    it('"59:59" for 59 minutes 59 seconds', () => {
        expect(formatRemaining((59 * 60 + 59) * 1000)).toBe("59:59");
    });

    it('"1:00:00" for exactly 1 hour', () => {
        expect(formatRemaining(3600 * 1000)).toBe("1:00:00");
    });

    it('"1:12:40" for 1 hour 12 minutes 40 seconds', () => {
        expect(formatRemaining((3600 + 12 * 60 + 40) * 1000)).toBe("1:12:40");
    });

    it('"1:00:01" for 3600001 ms (rounds up partial second)', () => {
        expect(formatRemaining(3600 * 1000 + 1)).toBe("1:00:01");
    });
});
