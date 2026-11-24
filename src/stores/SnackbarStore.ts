// outsource dependencies
import { makeAutoObservable } from "mobx";

// local dependencies
import { createId } from "../domain/id";

export type SnackbarEntry = {
    id: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
};

export type ShowSnackbarInput = {
    message: string;
    actionLabel?: string;
    onAction?: () => void;
    durationMs?: number;
};

const DEFAULT_DURATION_MS = 5000;

export class SnackbarStore {
    current: SnackbarEntry | null = null;
    bottomOffset: number | null = null;
    private timeoutId: ReturnType<typeof setTimeout> | null = null;

    constructor() {
        makeAutoObservable<SnackbarStore, "timeoutId">(this, {
            timeoutId: false,
        });
    }

    show({
        message,
        actionLabel,
        onAction,
        durationMs = DEFAULT_DURATION_MS,
    }: ShowSnackbarInput): string {
        this.clearTimer();
        const id = createId();
        const entry: SnackbarEntry = { id, message };
        if (actionLabel !== undefined) entry.actionLabel = actionLabel;
        if (onAction !== undefined) entry.onAction = onAction;
        this.current = entry;
        this.timeoutId = setTimeout(() => {
            this.timeoutId = null;
            this.dismiss();
        }, durationMs);
        return id;
    }

    dismiss() {
        this.clearTimer();
        this.current = null;
    }

    runAction() {
        const entry = this.current;
        if (entry === null) return;
        entry.onAction?.();
        this.dismiss();
    }

    setBottomOffset(offset: number | null) {
        this.bottomOffset = offset;
    }

    dispose() {
        this.clearTimer();
    }

    private clearTimer() {
        if (this.timeoutId !== null) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }
}
