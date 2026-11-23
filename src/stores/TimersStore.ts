// outsource dependencies
import { makeAutoObservable } from "mobx";

// local dependencies
import type { TimerKind } from "../theme";
import type { TimerState } from "../domain/timer";
import {
    pauseTimer,
    createTimer,
    resumeTimer,
    adjustTimer,
    restartTimer,
} from "../domain/timer";

type StartInput = {
    recipeId: string;
    stepId: string;
    kind: TimerKind;
    minutes: number;
};

export class TimersStore {
    timers = new Map<string, TimerState>();
    private clock: () => number;

    constructor(clock: () => number = Date.now) {
        this.clock = clock;
        makeAutoObservable<TimersStore, "clock">(this, { clock: false });
    }

    get(stepId: string): TimerState | undefined {
        return this.timers.get(stepId);
    }

    start(input: StartInput) {
        if (this.timers.has(input.stepId)) return;
        this.timers.set(input.stepId, createTimer(input, this.clock()));
    }

    pause(stepId: string) {
        const timer = this.timers.get(stepId);
        if (timer === undefined) return;
        this.timers.set(stepId, pauseTimer(timer, this.clock()));
    }

    resume(stepId: string) {
        const timer = this.timers.get(stepId);
        if (timer === undefined) return;
        this.timers.set(stepId, resumeTimer(timer, this.clock()));
    }

    adjust(stepId: string, deltaMinutes: number) {
        const timer = this.timers.get(stepId);
        if (timer === undefined) return;
        this.timers.set(stepId, adjustTimer(timer, deltaMinutes, this.clock()));
    }

    restart(stepId: string) {
        const timer = this.timers.get(stepId);
        if (timer === undefined) return;
        this.timers.set(stepId, restartTimer(timer, this.clock()));
    }

    remove(stepId: string) {
        this.timers.delete(stepId);
    }

    get hasRunning(): boolean {
        for (const timer of this.timers.values()) {
            if (timer.endsAt !== null) return true;
        }
        return false;
    }
}
