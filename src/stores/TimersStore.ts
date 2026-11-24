// outsource dependencies
import { makeAutoObservable } from "mobx";

// local dependencies
import { createId } from "../domain/id";
import type { TimerKind } from "../theme";
import type { TimerState } from "../domain/timer";
import { TimerStateSchema } from "../domain/timer";
import {
    pauseTimer,
    createTimer,
    resumeTimer,
    adjustTimer,
    restartTimer,
} from "../domain/timer";

export const TIMERS_STORAGE_KEY = "timers";
export const TIMERS_VERSION = 1;

export function parseTimers(
    data: unknown,
    version: number,
): TimerState[] | null {
    if (version !== TIMERS_VERSION) return null;
    if (!Array.isArray(data)) return null;

    const valid: TimerState[] = [];
    let dropped = 0;

    for (const item of data) {
        const result = TimerStateSchema.safeParse(item);
        if (result.success) {
            valid.push(result.data);
        } else {
            dropped += 1;
        }
    }

    if (__DEV__ && dropped > 0) {
        console.warn(
            `[TimersStore] dropped ${dropped} invalid timer(s) on load`,
        );
    }

    return valid;
}

type StartInput = {
    kind: TimerKind;
    minutes: number;
    label?: string;
    step?: { recipeId: string; stepId: string };
};

export class TimersStore {
    timers = new Map<string, TimerState>();
    private clock: () => number;

    constructor(clock: () => number = Date.now) {
        this.clock = clock;
        makeAutoObservable<TimersStore, "clock">(this, { clock: false });
    }

    get(id: string): TimerState | undefined {
        return this.timers.get(id);
    }

    findByStep(stepId: string): TimerState | undefined {
        for (const timer of this.timers.values()) {
            if (timer.step?.stepId === stepId) return timer;
        }
        return undefined;
    }

    start(input: StartInput): string {
        if (input.step !== undefined) {
            const existing = this.findByStep(input.step.stepId);
            if (existing !== undefined) return existing.id;
        }
        const id = createId();
        this.timers.set(id, createTimer(input, this.clock(), id));
        return id;
    }

    replaceAll(timers: TimerState[]) {
        this.timers = new Map(timers.map((t) => [t.id, t]));
    }

    pause(id: string) {
        const timer = this.timers.get(id);
        if (timer === undefined) return;
        this.timers.set(id, pauseTimer(timer, this.clock()));
    }

    resume(id: string) {
        const timer = this.timers.get(id);
        if (timer === undefined) return;
        this.timers.set(id, resumeTimer(timer, this.clock()));
    }

    adjust(id: string, deltaMinutes: number) {
        const timer = this.timers.get(id);
        if (timer === undefined) return;
        this.timers.set(id, adjustTimer(timer, deltaMinutes, this.clock()));
    }

    restart(id: string) {
        const timer = this.timers.get(id);
        if (timer === undefined) return;
        this.timers.set(id, restartTimer(timer, this.clock()));
    }

    remove(id: string) {
        this.timers.delete(id);
    }

    get list(): TimerState[] {
        return [...this.timers.values()].sort(
            (a, b) => a.createdAt - b.createdAt,
        );
    }

    get hasRunning(): boolean {
        for (const timer of this.timers.values()) {
            if (timer.endsAt !== null) return true;
        }
        return false;
    }
}
