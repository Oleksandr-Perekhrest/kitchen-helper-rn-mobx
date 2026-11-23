// outsource dependencies
import notifee, {
    AlarmType,
    TriggerType,
    AndroidImportance,
    AuthorizationStatus,
} from "react-native-notify-kit";

// local dependencies
import { TIMER_CHANNEL_ID } from "./types";
import type { TimerNotifier } from "./types";

export function createNotifyKitNotifier(): TimerNotifier {
    return {
        async prepare({ channelName }) {
            try {
                await notifee.createChannel({
                    id: TIMER_CHANNEL_ID,
                    name: channelName,
                    importance: AndroidImportance.HIGH,
                    sound: "default",
                    vibration: true,
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

        async schedule({ id, fireAt, title, body }) {
            if (fireAt <= Date.now()) return;
            try {
                await notifee.createTriggerNotification(
                    {
                        id,
                        title,
                        body,
                        android: {
                            channelId: TIMER_CHANNEL_ID,
                            pressAction: { id: "default" },
                        },
                        ios: {
                            sound: "default",
                            foregroundPresentationOptions: {
                                banner: true,
                                list: true,
                                sound: true,
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
