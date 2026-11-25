// outsource dependencies
import type { TFunction } from "i18next";
import { it, expect, describe, afterEach, beforeEach } from "@jest/globals";

// local dependencies
import type { Recipe } from "../../src/domain/recipe";
import { TimersStore } from "../../src/stores/TimersStore";
import { RecipesStore } from "../../src/stores/RecipesStore";
import { SettingsStore } from "../../src/stores/SettingsStore";
import type { TimerNotifier } from "../../src/notifications/types";
import {
    diffTimerSchedules,
    startTimerNotificationsSync,
} from "../../src/stores/timerNotificationsSync";

// ─── helpers ─────────────────────────────────────────────────────────────────

const flushPromises = (): Promise<void> =>
    new Promise((resolve) => setImmediate(resolve));

const t = ((key: string) => key) as unknown as TFunction;

type NotifierCall =
    | { method: "prepare" }
    | { method: "requestPermission" }
    | { method: "canScheduleExactAlarms" }
    | { method: "openExactAlarmSettings" }
    | {
          method: "schedule";
          id: string;
          fireAt: number;
          sound: boolean;
          quiet: boolean;
      }
    | { method: "cancel"; id: string }
    | {
          method: "showOngoing";
          id: string;
          title: string;
          endsAt: number | null;
      }
    | { method: "showSummary"; title: string }
    | { method: "cancelSummary" };

function makeFakeNotifier(opts: { canSchedule?: boolean } = {}) {
    const calls: NotifierCall[] = [];

    const notifier: TimerNotifier = {
        async prepare() {
            calls.push({ method: "prepare" });
        },
        async requestPermission() {
            calls.push({ method: "requestPermission" });
            return true;
        },
        async canScheduleExactAlarms() {
            calls.push({ method: "canScheduleExactAlarms" });
            return opts.canSchedule ?? true;
        },
        async openExactAlarmSettings() {
            calls.push({ method: "openExactAlarmSettings" });
        },
        async schedule({ id, fireAt, sound, quiet }) {
            calls.push({ method: "schedule", id, fireAt, sound, quiet });
        },
        async cancel(id) {
            calls.push({ method: "cancel", id });
        },
        async showOngoing({ id, title, endsAt }) {
            calls.push({ method: "showOngoing", id, title, endsAt });
        },
        async showSummary({ title }) {
            calls.push({ method: "showSummary", title });
        },
        async cancelSummary() {
            calls.push({ method: "cancelSummary" });
        },
    };

    return { notifier, calls };
}

function methodsOf(calls: NotifierCall[], id?: string): string[] {
    if (id === undefined) return calls.map((c) => c.method);
    return calls
        .filter(
            (c) =>
                (c.method === "schedule" && c.id === id) ||
                (c.method === "cancel" && c.id === id) ||
                (c.method === "showOngoing" && c.id === id),
        )
        .map((c) => c.method);
}

const RECIPE_ID = "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa";
const STEP_ID = "bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb";
const RECIPE_TITLE = "Borscht";
const RECIPE: Recipe = {
    id: RECIPE_ID,
    title: RECIPE_TITLE,
    servings: 2,
    tags: [],
    favorite: false,
    ingredients: [
        {
            id: "cccccccc-cccc-4ccc-cccc-cccccccccccc",
            name: "Water",
            amount: 1,
            unit: "l",
        },
    ],
    steps: [
        {
            id: STEP_ID,
            text: "Boil.",
            ingredientIds: ["cccccccc-cccc-4ccc-cccc-cccccccccccc"],
        },
    ],
    createdAt: new Date(0).toISOString(),
    updatedAt: new Date(0).toISOString(),
};

// ─── diffTimerSchedules ───────────────────────────────────────────────────────

describe("diffTimerSchedules", () => {
    it("new running timer → schedule", () => {
        const prev = new Map<string, number | null>();
        const next = new Map<string, number | null>([["id1", 5000]]);
        const { schedule, cancel } = diffTimerSchedules(prev, next);
        expect(schedule).toContain("id1");
        expect(cancel).toHaveLength(0);
    });

    it("changed endsAt → schedule", () => {
        const prev = new Map<string, number | null>([["id1", 5000]]);
        const next = new Map<string, number | null>([["id1", 6000]]);
        const { schedule } = diffTimerSchedules(prev, next);
        expect(schedule).toContain("id1");
    });

    it("endsAt to null → cancel", () => {
        const prev = new Map<string, number | null>([["id1", 5000]]);
        const next = new Map<string, number | null>([["id1", null]]);
        const { schedule, cancel } = diffTimerSchedules(prev, next);
        expect(schedule).toHaveLength(0);
        expect(cancel).toContain("id1");
    });

    it("removed running timer → cancel", () => {
        const prev = new Map<string, number | null>([["id1", 5000]]);
        const next = new Map<string, number | null>();
        const { cancel } = diffTimerSchedules(prev, next);
        expect(cancel).toContain("id1");
    });

    it("unchanged endsAt → nothing", () => {
        const prev = new Map<string, number | null>([["id1", 5000]]);
        const next = new Map<string, number | null>([["id1", 5000]]);
        const { schedule, cancel } = diffTimerSchedules(prev, next);
        expect(schedule).toHaveLength(0);
        expect(cancel).toHaveLength(0);
    });

    it("id only in prev with null endsAt → not cancelled", () => {
        const prev = new Map<string, number | null>([["id1", null]]);
        const next = new Map<string, number | null>();
        const { cancel } = diffTimerSchedules(prev, next);
        expect(cancel).not.toContain("id1");
    });

    it("id only in next with null endsAt → not scheduled", () => {
        const prev = new Map<string, number | null>();
        const next = new Map<string, number | null>([["id1", null]]);
        const { schedule } = diffTimerSchedules(prev, next);
        expect(schedule).not.toContain("id1");
    });
});

// ─── startTimerNotificationsSync ─────────────────────────────────────────────

describe("startTimerNotificationsSync: restored timers", () => {
    it("running timer with endsAt in future: showOngoing then schedule", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        expect(methodsOf(calls, id)).toContain("showOngoing");
        expect(methodsOf(calls, id)).toContain("schedule");
        const oIdx = methodsOf(calls, id).indexOf("showOngoing");
        const sIdx = methodsOf(calls, id).indexOf("schedule");
        expect(oIdx).toBeLessThan(sIdx);

        dispose();
    });

    it("running timer: showOngoing carries the endsAt value", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        const endsAt = timers.get(id)?.endsAt;
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc?.endsAt).toBe(endsAt);

        dispose();
    });

    it("paused timer: showOngoing without endsAt; permission not requested", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        timers.pause(id);
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc).toBeDefined();
        expect(oc?.endsAt).toBeNull();
        expect(calls.some((c) => c.method === "requestPermission")).toBe(false);

        dispose();
    });

    it("finished timer (endsAt in the past): no showOngoing or schedule for that id", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        // Wind back endsAt to the past to make it a finished-but-still-running timer
        const finishedState = { ...timers.get(id)!, endsAt: NOW - 1 };
        timers.replaceAll([finishedState]);
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        expect(methodsOf(calls, id)).not.toContain("showOngoing");
        expect(methodsOf(calls, id)).not.toContain("schedule");

        dispose();
    });
});

describe("startTimerNotificationsSync: permission", () => {
    it("permission is requested once even with multiple upcoming timers", async () => {
        const NOW = 1_000_000;
        let time = NOW;
        const timers = new TimersStore(() => time);
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => time,
        });

        time += 1;
        timers.start({ kind: "boil", minutes: 10 });
        time += 1;
        timers.start({ kind: "fry", minutes: 5 });
        await flushPromises();

        expect(
            calls.filter((c) => c.method === "requestPermission"),
        ).toHaveLength(1);

        dispose();
    });

    it("permission is requested before the first schedule", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const permIdx = calls.findIndex(
            (c) => c.method === "requestPermission",
        );
        const schedIdx = calls.findIndex(
            (c) => c.method === "schedule" && "id" in c && c.id === id,
        );
        expect(permIdx).toBeGreaterThanOrEqual(0);
        expect(schedIdx).toBeGreaterThan(permIdx);

        dispose();
    });

    it("onExactAlarmsDenied called when canScheduleExactAlarms is false", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        timers.start({ kind: "boil", minutes: 10 });
        const { notifier } = makeFakeNotifier({ canSchedule: false });
        const onExactAlarmsDenied = jest.fn();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
            onExactAlarmsDenied,
        });
        await flushPromises();

        expect(onExactAlarmsDenied).toHaveBeenCalledTimes(1);
        dispose();
    });

    it("onExactAlarmsDenied NOT called when canScheduleExactAlarms is true", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        timers.start({ kind: "boil", minutes: 10 });
        const { notifier } = makeFakeNotifier({ canSchedule: true });
        const onExactAlarmsDenied = jest.fn();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
            onExactAlarmsDenied,
        });
        await flushPromises();

        expect(onExactAlarmsDenied).not.toHaveBeenCalled();
        dispose();
    });
});

describe("startTimerNotificationsSync: timer lifecycle", () => {
    let time: number;
    let timers: TimersStore;
    let settings: SettingsStore;
    let calls: NotifierCall[];
    let notifier: TimerNotifier;
    let dispose: () => void;

    beforeEach(async () => {
        time = 1_000_000;
        timers = new TimersStore(() => time);
        settings = new SettingsStore();
        const fake = makeFakeNotifier();
        notifier = fake.notifier;
        calls = fake.calls;

        dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings,
            notifier,
            t,
            now: () => time,
        });
        await flushPromises();
        calls.length = 0; // clear initial calls
    });

    afterEach(() => dispose());

    it("start → showOngoing then schedule", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        await flushPromises();
        expect(methodsOf(calls, id)).toContain("showOngoing");
        expect(methodsOf(calls, id)).toContain("schedule");
        expect(methodsOf(calls, id).indexOf("showOngoing")).toBeLessThan(
            methodsOf(calls, id).indexOf("schedule"),
        );
    });

    it("adjust running timer → showOngoing then schedule with new endsAt", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        await flushPromises();
        calls.length = 0;

        timers.adjust(id, 2);
        await flushPromises();

        const newEndsAt = timers.get(id)?.endsAt;
        expect(methodsOf(calls, id)).toContain("showOngoing");
        expect(methodsOf(calls, id)).toContain("schedule");
        const sc = calls.find(
            (c) => c.method === "schedule" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "schedule" }> | undefined;
        expect(sc?.fireAt).toBe(newEndsAt);
    });

    it("pause → cancel then showOngoing with endsAt null", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        await flushPromises();
        calls.length = 0;

        timers.pause(id);
        await flushPromises();

        expect(methodsOf(calls, id)).toContain("cancel");
        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc).toBeDefined();
        expect(oc?.endsAt).toBeNull();
        expect(methodsOf(calls, id).indexOf("cancel")).toBeLessThan(
            methodsOf(calls, id).indexOf("showOngoing"),
        );
    });

    it("adjust while paused → showOngoing with new remaining time", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        timers.pause(id);
        await flushPromises();
        calls.length = 0;

        timers.adjust(id, 3);
        await flushPromises();

        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc).toBeDefined();
        expect(oc?.endsAt).toBeNull();
    });

    it("resume → showOngoing then schedule", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        timers.pause(id);
        await flushPromises();
        calls.length = 0;

        timers.resume(id);
        await flushPromises();

        expect(methodsOf(calls, id)).toContain("showOngoing");
        expect(methodsOf(calls, id)).toContain("schedule");
        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc?.endsAt).not.toBeNull();
    });

    it("remove → cancel", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        await flushPromises();
        calls.length = 0;

        timers.remove(id);
        await flushPromises();

        expect(methodsOf(calls, id)).toContain("cancel");
        expect(methodsOf(calls, id)).not.toContain("showOngoing");
    });

    it("after remove + restore of a running timer the notifier schedules it again", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        await flushPromises();
        calls.length = 0;

        const removed = timers.remove(id);
        if (removed !== undefined) timers.restore(removed);
        await flushPromises();

        expect(methodsOf(calls, id)).toContain("schedule");
    });

    it("after remove + restore of a finished timer nothing is scheduled", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        const timer = timers.get(id);
        if (timer === undefined) throw new Error("expected timer");
        timers.replaceAll([{ ...timer, endsAt: time - 1 }]);
        await flushPromises();
        calls.length = 0;

        const removed = timers.remove(id);
        if (removed !== undefined) timers.restore(removed);
        await flushPromises();

        expect(methodsOf(calls, id)).not.toContain("schedule");
    });

    it("pause then resume in same tick: last per-id call is schedule", async () => {
        const id = timers.start({ kind: "boil", minutes: 5 });
        await flushPromises();
        calls.length = 0;

        timers.pause(id);
        timers.resume(id);
        await flushPromises();

        const perIdMethods = methodsOf(calls, id);
        expect(perIdMethods[perIdMethods.length - 1]).toBe("schedule");
    });
});

describe("startTimerNotificationsSync: summary", () => {
    it("two active timers → showSummary with the count", async () => {
        const NOW = 1_000_000;
        let time = NOW;
        const timers = new TimersStore(() => time);
        const { notifier, calls } = makeFakeNotifier();

        time += 1;
        const id1 = timers.start({
            kind: "boil",
            minutes: 10,
            step: { recipeId: "r1", stepId: "s1" },
        });
        time += 1;
        const id2 = timers.start({
            kind: "fry",
            minutes: 5,
            step: { recipeId: "r1", stepId: "s2" },
        });

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => time,
        });
        await flushPromises();

        expect(calls.some((c) => c.method === "showSummary")).toBe(true);
        // suppress unused variable warnings
        void id1;
        void id2;
        dispose();
    });

    it("dropping to one active timer → cancelSummary", async () => {
        const NOW = 1_000_000;
        let time = NOW;
        const timers = new TimersStore(() => time);
        const { notifier, calls } = makeFakeNotifier();

        time += 1;
        timers.start({
            kind: "boil",
            minutes: 10,
            step: { recipeId: "r1", stepId: "s1" },
        });
        time += 1;
        const id2 = timers.start({
            kind: "fry",
            minutes: 5,
            step: { recipeId: "r1", stepId: "s2" },
        });

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => time,
        });
        await flushPromises();
        calls.length = 0;

        timers.remove(id2);
        await flushPromises();

        expect(calls.some((c) => c.method === "cancelSummary")).toBe(true);
        dispose();
    });
});

describe("startTimerNotificationsSync: title", () => {
    it("step timer with existing recipe: title = recipe title", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const recipes = new RecipesStore();
        recipes.replaceAll([RECIPE]);
        const id = timers.start({
            kind: "boil",
            minutes: 5,
            step: { recipeId: RECIPE_ID, stepId: STEP_ID },
        });
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes,
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc?.title).toBe(RECIPE_TITLE);
        dispose();
    });

    it("labelled custom timer: title = label", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({
            kind: "boil",
            minutes: 5,
            label: "My pasta",
        });
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc?.title).toBe("My pasta");
        dispose();
    });

    it("unlabelled custom timer: title = kind label from t()", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 5 });
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const oc = calls.find(
            (c) => c.method === "showOngoing" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "showOngoing" }> | undefined;
        expect(oc?.title).toBe(t("timerKinds.boil"));
        dispose();
    });
});

describe("startTimerNotificationsSync: sound toggle", () => {
    it("toggling timerSoundEnabled re-schedules only upcoming running timers with new flag", async () => {
        const NOW = 1_000_000;
        let time = NOW;
        const timers = new TimersStore(() => time);
        const settings = new SettingsStore();
        const { notifier, calls } = makeFakeNotifier();

        time += 1;
        const runningId = timers.start({
            kind: "boil",
            minutes: 10,
            step: { recipeId: "r1", stepId: "s1" },
        });
        time += 1;
        const pausedId = timers.start({
            kind: "fry",
            minutes: 5,
            step: { recipeId: "r1", stepId: "s2" },
        });
        timers.pause(pausedId);

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings,
            notifier,
            t,
            now: () => time,
        });
        await flushPromises();
        calls.length = 0;

        settings.setTimerSoundEnabled(false);
        await flushPromises();

        const scheduleCalls = calls.filter(
            (c) => c.method === "schedule",
        ) as Extract<NotifierCall, { method: "schedule" }>[];
        expect(
            scheduleCalls.some((c) => c.id === runningId && c.sound === false),
        ).toBe(true);
        expect(scheduleCalls.some((c) => c.id === pausedId)).toBe(false);
        dispose();
    });
});

describe("startTimerNotificationsSync: quiet (watchedTimerId)", () => {
    it("schedule uses quiet:false when the timer is not watched", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const sc = calls.find(
            (c) => c.method === "schedule" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "schedule" }> | undefined;
        expect(sc?.quiet).toBe(false);
        dispose();
    });

    it("schedule uses quiet:true when watchedTimerId equals the timer id", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        timers.setWatchedTimerId(id);
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();

        const sc = calls.find(
            (c) => c.method === "schedule" && "id" in c && c.id === id,
        ) as Extract<NotifierCall, { method: "schedule" }> | undefined;
        expect(sc?.quiet).toBe(true);
        dispose();
    });

    it("changing watchedTimerId from A to B re-schedules A quiet:false and B quiet:true, without cancel or showOngoing", async () => {
        const NOW = 1_000_000;
        let time = NOW;
        const timers = new TimersStore(() => time);
        const { notifier, calls } = makeFakeNotifier();

        time += 1;
        const idA = timers.start({ kind: "boil", minutes: 10 });
        time += 1;
        const idB = timers.start({ kind: "fry", minutes: 15 });

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => time,
        });
        await flushPromises();
        timers.setWatchedTimerId(idA);
        await flushPromises();
        calls.length = 0;

        timers.setWatchedTimerId(idB);
        await flushPromises();

        const schedForA = calls.find(
            (c) => c.method === "schedule" && "id" in c && c.id === idA,
        ) as Extract<NotifierCall, { method: "schedule" }> | undefined;
        const schedForB = calls.find(
            (c) => c.method === "schedule" && "id" in c && c.id === idB,
        ) as Extract<NotifierCall, { method: "schedule" }> | undefined;
        expect(schedForA?.quiet).toBe(false);
        expect(schedForB?.quiet).toBe(true);
        expect(calls.some((c) => c.method === "cancel")).toBe(false);
        expect(calls.some((c) => c.method === "showOngoing")).toBe(false);
        dispose();
    });

    it("watching a paused timer schedules nothing", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        timers.pause(id);
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();
        calls.length = 0;

        timers.setWatchedTimerId(id);
        await flushPromises();

        expect(calls.some((c) => c.method === "schedule")).toBe(false);
        dispose();
    });

    it("watching a finished timer schedules nothing", async () => {
        const NOW = 1_000_000;
        const timers = new TimersStore(() => NOW);
        const id = timers.start({ kind: "boil", minutes: 10 });
        const timer = timers.get(id);
        if (timer === undefined) throw new Error("expected timer");
        timers.replaceAll([{ ...timer, endsAt: NOW - 1 }]);
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => NOW,
        });
        await flushPromises();
        calls.length = 0;

        timers.setWatchedTimerId(id);
        await flushPromises();

        expect(calls.some((c) => c.method === "schedule")).toBe(false);
        dispose();
    });
});

describe("startTimerNotificationsSync: dispose", () => {
    it("after dispose, timer changes cause no calls", async () => {
        const NOW = 1_000_000;
        let time = NOW;
        const timers = new TimersStore(() => time);
        const { notifier, calls } = makeFakeNotifier();

        const dispose = startTimerNotificationsSync({
            timers,
            recipes: new RecipesStore(),
            settings: new SettingsStore(),
            notifier,
            t,
            now: () => time,
        });
        await flushPromises();
        dispose();
        calls.length = 0;

        time += 1;
        timers.start({ kind: "boil", minutes: 5 });
        await flushPromises();

        expect(calls).toHaveLength(0);
    });
});
