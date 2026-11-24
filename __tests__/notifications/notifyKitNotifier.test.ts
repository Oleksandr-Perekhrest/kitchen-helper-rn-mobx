// outsource dependencies
import { Platform } from "react-native";
import {
    it,
    jest,
    expect,
    describe,
    afterEach,
    beforeEach,
} from "@jest/globals";
import notifee, {
    AuthorizationStatus,
    IOSNotificationSetting,
    IOSShowPreviewsSetting,
    AndroidNotificationSetting,
} from "react-native-notify-kit";

// local dependencies
import { createNotifyKitNotifier } from "../../src/notifications/notifyKitNotifier";
import {
    TIMER_CHANNEL_ID,
    TIMER_SILENT_CHANNEL_ID,
    TIMER_ONGOING_CHANNEL_ID,
} from "../../src/notifications/types";

// ─── helpers ─────────────────────────────────────────────────────────────────

const FUTURE = Date.now() + 60_000;

const mockCreateTrigger =
    notifee.createTriggerNotification as jest.MockedFunction<
        typeof notifee.createTriggerNotification
    >;
const mockDisplay = notifee.displayNotification as jest.MockedFunction<
    typeof notifee.displayNotification
>;
const mockGetSettings = notifee.getNotificationSettings as jest.MockedFunction<
    typeof notifee.getNotificationSettings
>;

beforeEach(() => {
    jest.clearAllMocks();
});

afterEach(() => {
    jest.restoreAllMocks();
});

// ─── schedule ────────────────────────────────────────────────────────────────

describe("createNotifyKitNotifier().schedule", () => {
    it("uses the timers channel and sets iOS sound when sound is true", async () => {
        const n = createNotifyKitNotifier();
        await n.schedule({
            id: "id1",
            fireAt: FUTURE,
            title: "T",
            body: "B",
            sound: true,
        });

        expect(mockCreateTrigger).toHaveBeenCalledTimes(1);
        const [notification] = mockCreateTrigger.mock.calls[0] as Parameters<
            typeof notifee.createTriggerNotification
        >;
        expect(notification.android?.channelId).toBe(TIMER_CHANNEL_ID);
        expect(notification.ios?.sound).toBe("default");
    });

    it("uses the silent channel and no iOS sound when sound is false", async () => {
        const n = createNotifyKitNotifier();
        await n.schedule({
            id: "id1",
            fireAt: FUTURE,
            title: "T",
            body: "B",
            sound: false,
        });

        const [notification] = mockCreateTrigger.mock.calls[0] as Parameters<
            typeof notifee.createTriggerNotification
        >;
        expect(notification.android?.channelId).toBe(TIMER_SILENT_CHANNEL_ID);
        expect(notification.ios?.sound).toBeUndefined();
    });

    it("sets data.timerId to the notification id", async () => {
        const n = createNotifyKitNotifier();
        await n.schedule({
            id: "my-timer",
            fireAt: FUTURE,
            title: "T",
            body: "B",
            sound: true,
        });

        const [notification] = mockCreateTrigger.mock.calls[0] as Parameters<
            typeof notifee.createTriggerNotification
        >;
        expect((notification.data as Record<string, unknown>)?.timerId).toBe(
            "my-timer",
        );
    });

    it("does nothing when fireAt is not in the future", async () => {
        const n = createNotifyKitNotifier();
        await n.schedule({
            id: "id1",
            fireAt: Date.now() - 1000,
            title: "T",
            body: "B",
            sound: true,
        });
        expect(mockCreateTrigger).not.toHaveBeenCalled();
    });

    it("logs a warning and does not throw when the native call rejects", async () => {
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        mockCreateTrigger.mockRejectedValueOnce(new Error("native fail"));

        const n = createNotifyKitNotifier();
        await expect(
            n.schedule({
                id: "id1",
                fireAt: FUTURE,
                title: "T",
                body: "B",
                sound: true,
            }),
        ).resolves.toBeUndefined();
        expect(warnSpy).toHaveBeenCalled();
    });
});

// ─── showOngoing ─────────────────────────────────────────────────────────────

describe("createNotifyKitNotifier().showOngoing", () => {
    it("on Android: displays with ongoing flag and ongoing channel", async () => {
        jest.replaceProperty(Platform, "OS", "android");
        const n = createNotifyKitNotifier();
        await n.showOngoing({
            id: "id1",
            title: "T",
            body: "B",
            endsAt: FUTURE,
        });

        expect(mockDisplay).toHaveBeenCalledTimes(1);
        const [notification] = mockDisplay.mock.calls[0] as Parameters<
            typeof notifee.displayNotification
        >;
        expect(notification.android?.ongoing).toBe(true);
        expect(notification.android?.channelId).toBe(TIMER_ONGOING_CHANNEL_ID);
    });

    it("on Android with endsAt: sets chronometer counting down", async () => {
        jest.replaceProperty(Platform, "OS", "android");
        const n = createNotifyKitNotifier();
        await n.showOngoing({
            id: "id1",
            title: "T",
            body: "B",
            endsAt: FUTURE,
        });

        const [notification] = mockDisplay.mock.calls[0] as Parameters<
            typeof notifee.displayNotification
        >;
        expect(notification.android?.showChronometer).toBe(true);
        expect(notification.android?.chronometerDirection).toBe("down");
        expect(notification.android?.timestamp).toBe(FUTURE);
    });

    it("on Android with endsAt null: no chronometer", async () => {
        jest.replaceProperty(Platform, "OS", "android");
        const n = createNotifyKitNotifier();
        await n.showOngoing({ id: "id1", title: "T", body: "B", endsAt: null });

        const [notification] = mockDisplay.mock.calls[0] as Parameters<
            typeof notifee.displayNotification
        >;
        expect(notification.android?.showChronometer).toBeUndefined();
        expect(notification.android?.timestamp).toBeUndefined();
    });

    it("on iOS: no native call", async () => {
        jest.replaceProperty(Platform, "OS", "ios");
        const n = createNotifyKitNotifier();
        await n.showOngoing({ id: "id1", title: "T", body: "B", endsAt: null });

        expect(mockDisplay).not.toHaveBeenCalled();
    });

    it("logs a warning and does not throw when the native call rejects on Android", async () => {
        jest.replaceProperty(Platform, "OS", "android");
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        mockDisplay.mockRejectedValueOnce(new Error("native fail"));

        const n = createNotifyKitNotifier();
        await expect(
            n.showOngoing({ id: "id1", title: "T", body: "B", endsAt: null }),
        ).resolves.toBeUndefined();
        expect(warnSpy).toHaveBeenCalled();
    });
});

// ─── canScheduleExactAlarms ───────────────────────────────────────────────────

function makeNotifSettings(alarm: AndroidNotificationSetting) {
    const enabled = IOSNotificationSetting.ENABLED;
    return {
        authorizationStatus: AuthorizationStatus.AUTHORIZED,
        android: {
            alarm,
            fullScreenIntent: AndroidNotificationSetting.ENABLED,
        },
        ios: {
            alert: enabled,
            badge: enabled,
            sound: enabled,
            carPlay: enabled,
            criticalAlert: enabled,
            announcement: enabled,
            lockScreen: enabled,
            notificationCenter: enabled,
            showPreviews: IOSShowPreviewsSetting.ALWAYS,
            inAppNotificationSettings: enabled,
            authorizationStatus: AuthorizationStatus.AUTHORIZED,
        },
        web: {},
    };
}

describe("createNotifyKitNotifier().canScheduleExactAlarms", () => {
    it("returns false when alarm setting is DISABLED", async () => {
        mockGetSettings.mockResolvedValueOnce(
            makeNotifSettings(AndroidNotificationSetting.DISABLED),
        );
        const n = createNotifyKitNotifier();
        expect(await n.canScheduleExactAlarms()).toBe(false);
    });

    it("returns true when alarm setting is ENABLED", async () => {
        mockGetSettings.mockResolvedValueOnce(
            makeNotifSettings(AndroidNotificationSetting.ENABLED),
        );
        const n = createNotifyKitNotifier();
        expect(await n.canScheduleExactAlarms()).toBe(true);
    });

    it("returns true when alarm setting is NOT_SUPPORTED", async () => {
        mockGetSettings.mockResolvedValueOnce(
            makeNotifSettings(AndroidNotificationSetting.NOT_SUPPORTED),
        );
        const n = createNotifyKitNotifier();
        expect(await n.canScheduleExactAlarms()).toBe(true);
    });

    it("returns true (safe default) when native call rejects", async () => {
        const warnSpy = jest
            .spyOn(console, "warn")
            .mockImplementation(() => undefined);
        mockGetSettings.mockRejectedValueOnce(new Error("fail"));

        const n = createNotifyKitNotifier();
        expect(await n.canScheduleExactAlarms()).toBe(true);
        expect(warnSpy).toHaveBeenCalled();
    });
});
