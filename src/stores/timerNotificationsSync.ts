// outsource dependencies
import type { TFunction } from "i18next";
import { reaction, compareStructural } from "mobx";

// local dependencies
import type { TimersStore } from "./TimersStore";
import type { TimerState } from "../domain/timer";
import { formatRemaining } from "../domain/timer";
import type { RecipesStore } from "./RecipesStore";
import type { SettingsStore } from "./SettingsStore";
import type { TimerNotifier } from "../notifications/types";

export function diffTimerSchedules(
    prev: ReadonlyMap<string, number | null>,
    next: ReadonlyMap<string, number | null>,
): { schedule: string[]; cancel: string[] } {
    const schedule: string[] = [];
    const cancel: string[] = [];

    for (const [id, endsAt] of next) {
        if (endsAt === null) continue;
        const prevEndsAt = prev.get(id);
        if (prevEndsAt === undefined || prevEndsAt !== endsAt) {
            schedule.push(id);
        }
    }

    for (const [id, endsAt] of prev) {
        if (endsAt === null) continue;
        const nextEndsAt = next.get(id);
        if (nextEndsAt === undefined || nextEndsAt === null) {
            cancel.push(id);
        }
    }

    return { schedule, cancel };
}

type Options = {
    timers: TimersStore;
    recipes: RecipesStore;
    notifier: TimerNotifier;
    settings: SettingsStore;
    t: TFunction;
    now?: () => number;
    onExactAlarmsDenied?: () => void;
};

type Snapshot = { endsAt: number | null; remainingMs: number };

export function startTimerNotificationsSync(options: Options): () => void {
    const {
        t,
        timers,
        recipes,
        notifier,
        settings,
        now = Date.now,
        onExactAlarmsDenied,
    } = options;

    let prevSnapshots: ReadonlyMap<string, Snapshot> = new Map();
    let permissionPromise: Promise<unknown> | null = null;
    const chains = new Map<string, Promise<void>>();

    const chain = (id: string, work: () => Promise<void>) => {
        const previous = chains.get(id) ?? Promise.resolve();
        const next = previous.then(
            () => work(),
            () => work(),
        );
        chains.set(id, next);
        const cleanup = () => {
            if (chains.get(id) === next) chains.delete(id);
        };
        void next.then(cleanup, cleanup);
    };

    const buildContent = (
        timer: TimerState,
    ): { title: string; body: string; kindLabel: string } => {
        const kindLabel = t(`timerKinds.${timer.kind}`);
        const recipe =
            timer.step !== undefined
                ? recipes.byId.get(timer.step.recipeId)
                : undefined;
        const title =
            recipe !== undefined ? recipe.title : (timer.label ?? kindLabel);
        const body = t("notifications.timerDone", { kind: kindLabel });
        return { title, body, kindLabel };
    };

    const dispose = reaction(
        () => {
            const map = new Map<string, Snapshot>();
            for (const timer of timers.list) {
                map.set(timer.id, {
                    endsAt: timer.endsAt,
                    remainingMs: timer.remainingMs,
                });
            }
            return map;
        },
        (next) => {
            const prevMap = prevSnapshots;
            prevSnapshots = next;

            const nowMs = now();

            const prevEndsAt = new Map<string, number | null>();
            for (const [id, s] of prevMap) prevEndsAt.set(id, s.endsAt);
            const nextEndsAt = new Map<string, number | null>();
            for (const [id, s] of next) nextEndsAt.set(id, s.endsAt);
            const { schedule } = diffTimerSchedules(prevEndsAt, nextEndsAt);

            // Finished timers are kept after restart by design; skip them so
            // restoring state doesn't prompt for permission or schedule past fires.
            const upcoming = schedule.filter((id) => {
                const endsAt = timers.get(id)?.endsAt;
                return (
                    endsAt !== undefined && endsAt !== null && endsAt > nowMs
                );
            });

            if (upcoming.length > 0 && permissionPromise === null) {
                permissionPromise = notifier
                    .requestPermission()
                    .then(async () => {
                        const canSchedule =
                            await notifier.canScheduleExactAlarms();
                        if (!canSchedule) {
                            onExactAlarmsDenied?.();
                        }
                    })
                    .catch(() => undefined);
            }

            for (const id of prevMap.keys()) {
                if (!next.has(id)) {
                    chain(id, () => notifier.cancel(id));
                }
            }

            for (const [id, snap] of next) {
                if (snap.endsAt !== null) continue;
                const prev = prevMap.get(id);
                if (
                    prev !== undefined &&
                    prev.endsAt === null &&
                    prev.remainingMs === snap.remainingMs
                ) {
                    continue;
                }
                const timer = timers.get(id);
                if (timer === undefined) continue;
                const { title } = buildContent(timer);
                const remainingMs = timer.remainingMs;
                chain(id, async () => {
                    await notifier.cancel(id);
                    await notifier.showOngoing({
                        id,
                        title,
                        body: t("notifications.paused", {
                            time: formatRemaining(remainingMs),
                        }),
                        endsAt: null,
                    });
                });
            }

            for (const id of upcoming) {
                const timer = timers.get(id);
                if (timer === undefined) continue;
                const endsAt = timer.endsAt;
                if (endsAt === null) continue;

                const { title, body, kindLabel } = buildContent(timer);
                const pending = permissionPromise;

                chain(id, async () => {
                    if (pending !== null) await pending;
                    await notifier.showOngoing({
                        id,
                        title,
                        body: kindLabel,
                        endsAt,
                    });
                    await notifier.schedule({
                        id,
                        fireAt: endsAt,
                        title,
                        body,
                        sound: settings.timerSoundEnabled,
                    });
                });
            }
        },
        { equals: compareStructural, fireImmediately: true },
    );

    const disposeSummary = reaction(
        () => {
            const nowMs = now();
            let count = 0;
            for (const timer of timers.list) {
                if (timer.endsAt === null) {
                    count += 1;
                } else if (timer.endsAt > nowMs) {
                    count += 1;
                }
            }
            return count;
        },
        (count) => {
            if (count >= 2) {
                void notifier.showSummary({
                    title: t("notifications.activeCount", { count }),
                });
            } else {
                void notifier.cancelSummary();
            }
        },
        { fireImmediately: true },
    );

    const disposeSound = reaction(
        () => settings.timerSoundEnabled,
        (sound) => {
            const nowMs = now();
            for (const timer of timers.list) {
                const { id, endsAt } = timer;
                if (endsAt === null || endsAt <= nowMs) continue;
                const { title, body } = buildContent(timer);
                const pending = permissionPromise;
                chain(id, async () => {
                    if (pending !== null) await pending;
                    await notifier.schedule({
                        id,
                        fireAt: endsAt,
                        title,
                        body,
                        sound,
                    });
                });
            }
        },
    );

    return () => {
        dispose();
        disposeSummary();
        disposeSound();
    };
}
