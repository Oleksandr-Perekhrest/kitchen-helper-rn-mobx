// outsource dependencies
import type { TFunction } from "i18next";
import { reaction, compareStructural } from "mobx";

// local dependencies
import type { TimersStore } from "./TimersStore";
import type { RecipesStore } from "./RecipesStore";
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
    t: TFunction;
};

export function startTimerNotificationsSync(options: Options): () => void {
    const { t, timers, recipes, notifier } = options;

    let prev: ReadonlyMap<string, number | null> = new Map();
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

    const dispose = reaction(
        () => {
            const map = new Map<string, number | null>();
            for (const timer of timers.list) {
                map.set(timer.id, timer.endsAt);
            }
            return map;
        },
        (next) => {
            const { schedule, cancel } = diffTimerSchedules(prev, next);
            prev = next;

            if (schedule.length > 0 && permissionPromise === null) {
                permissionPromise = notifier
                    .requestPermission()
                    .catch(() => undefined);
            }

            for (const id of cancel) {
                chain(id, () => notifier.cancel(id));
            }

            for (const id of schedule) {
                const timer = timers.get(id);
                if (timer === undefined) continue;
                const endsAt = timer.endsAt;
                if (endsAt === null) continue;

                const kindLabel = t(`timerKinds.${timer.kind}`);
                const recipe =
                    timer.step !== undefined
                        ? recipes.byId.get(timer.step.recipeId)
                        : undefined;
                const title =
                    recipe !== undefined
                        ? recipe.title
                        : (timer.label ?? kindLabel);
                const body = t("notifications.timerDone", { kind: kindLabel });
                const pending = permissionPromise;

                chain(id, async () => {
                    if (pending !== null) await pending;
                    await notifier.schedule({
                        id,
                        fireAt: endsAt,
                        title,
                        body,
                    });
                });
            }
        },
        { equals: compareStructural, fireImmediately: true },
    );

    return dispose;
}
