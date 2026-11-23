// local dependencies
import type { TimerKind } from "../theme";

export const MAX_TIMER_MS = 1440 * 60_000;

export type TimerState = {
    id: string;
    kind: TimerKind;
    label?: string;
    step?: { recipeId: string; stepId: string };
    createdAt: number;
    durationMs: number;
    endsAt: number | null;
    remainingMs: number;
};

type CreateTimerInput = {
    kind: TimerKind;
    minutes: number;
    label?: string;
    step?: { recipeId: string; stepId: string };
};

export function createTimer(
    input: CreateTimerInput,
    now: number,
    id: string,
): TimerState {
    const durationMs = input.minutes * 60_000;
    return {
        id,
        kind: input.kind,
        label: input.label,
        step: input.step,
        createdAt: now,
        durationMs,
        endsAt: now + durationMs,
        remainingMs: durationMs,
    };
}

export function getRemainingMs(timer: TimerState, now: number): number {
    if (timer.endsAt !== null) {
        return Math.max(0, timer.endsAt - now);
    }
    return timer.remainingMs;
}

export function isRunning(timer: TimerState): boolean {
    return timer.endsAt !== null;
}

export function isDone(timer: TimerState, now: number): boolean {
    return getRemainingMs(timer, now) === 0;
}

export function pauseTimer(timer: TimerState, now: number): TimerState {
    if (timer.endsAt === null) return timer;
    return {
        ...timer,
        endsAt: null,
        remainingMs: getRemainingMs(timer, now),
    };
}

export function resumeTimer(timer: TimerState, now: number): TimerState {
    if (timer.endsAt !== null || timer.remainingMs <= 0) return timer;
    return {
        ...timer,
        endsAt: now + timer.remainingMs,
    };
}

export function adjustTimer(
    timer: TimerState,
    deltaMinutes: number,
    now: number,
): TimerState {
    const next = Math.max(
        0,
        Math.min(
            getRemainingMs(timer, now) + deltaMinutes * 60_000,
            MAX_TIMER_MS,
        ),
    );
    if (timer.endsAt !== null) {
        return { ...timer, endsAt: now + next, remainingMs: next };
    }
    return { ...timer, remainingMs: next };
}

export function restartTimer(timer: TimerState, now: number): TimerState {
    return {
        ...timer,
        endsAt: now + timer.durationMs,
        remainingMs: timer.durationMs,
    };
}

export function formatRemaining(ms: number): string {
    if (ms <= 0) return "0:00";
    const totalSecs = Math.ceil(ms / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    const ss = String(seconds).padStart(2, "0");
    if (hours >= 1) {
        const mm = String(minutes).padStart(2, "0");
        return `${hours}:${mm}:${ss}`;
    }
    return `${minutes}:${ss}`;
}
