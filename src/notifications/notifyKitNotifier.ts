// outsource dependencies
import notifee, {
    AlarmType,
    TriggerType,
    AndroidImportance,
    AuthorizationStatus,
    AndroidNotificationSetting,
} from "react-native-notify-kit";

// local dependencies
import type { TimerNotifier } from "./types";
import { TIMER_CHANNEL_ID, TIMER_SILENT_CHANNEL_ID } from "./types";

export function createNotifyKitNotifier(): TimerNotifier {
    return {
        async prepare({ channelName, silentChannelName }) {
            try {
                await notifee.createChannel({
                    id: TIMER_CHANNEL_ID,
                    name: channelName,
                    importance: AndroidImportance.HIGH,
                    sound: "default",
                    vibration: true,
                });
                await notifee.createChannel({
                    id: TIMER_SILENT_CHANNEL_ID,
                    name: silentChannelName,
                    importance: AndroidImportance.HIGH,
                    vibration: false,
                });
            } catch (e) {
                console.warn("[notifications] createChannel failed", e);
            }
        },

        async requestPermission() {
            try {
                const settings = await notifee.requestPermission();
                return (
                    settings.authorizationStatus ===
                        AuthorizationStatus.AUTHORIZED ||
                    settings.authorizationStatus ===
                        AuthorizationStatus.PROVISIONAL
                );
            } catch (e) {
                console.warn("[notifications] requestPermission failed", e);
                return false;
            }
        },

        async canScheduleExactAlarms() {
            try {
                const settings = await notifee.getNotificationSettings();
                return (
                    settings.android.alarm !==
                    AndroidNotificationSetting.DISABLED
                );
            } catch (e) {
                console.warn(
                    "[notifications] canScheduleExactAlarms failed",
                    e,
                );
                return true;
            }
        },

        async openExactAlarmSettings() {
            try {
                await notifee.openAlarmPermissionSettings();
            } catch (e) {
                console.warn(
                    "[notifications] openExactAlarmSettings failed",
                    e,
                );
            }
        },

        async schedule({ id, fireAt, title, body, sound }) {
            if (fireAt <= Date.now()) return;
            try {
                await notifee.createTriggerNotification(
                    {
                        id,
                        title,
                        body,
                        android: {
                            channelId: sound
                                ? TIMER_CHANNEL_ID
                                : TIMER_SILENT_CHANNEL_ID,
                            pressAction: { id: "default" },
                        },
                        ios: {
                            ...(sound ? { sound: "default" } : {}),
                            foregroundPresentationOptions: {
                                banner: true,
                                list: true,
                                sound,
                            },
                        },
                    },
                    {
                        type: TriggerType.TIMESTAMP,
                        timestamp: fireAt,
                        alarmManager: {
                            type: AlarmType.SET_EXACT_AND_ALLOW_WHILE_IDLE,
                        },
                    },
                );
            } catch (e) {
                console.warn("[notifications] schedule failed", e);
            }
        },

        async cancel(id) {
            try {
                await notifee.cancelNotification(id);
            } catch (e) {
                console.warn("[notifications] cancel failed", e);
            }
        },
    };
}
