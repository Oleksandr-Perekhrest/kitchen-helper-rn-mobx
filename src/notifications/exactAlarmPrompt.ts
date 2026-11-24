// outsource dependencies
import { Alert } from "react-native";
import type { TFunction } from "i18next";

// local dependencies
import type { TimerNotifier } from "./types";

export function showExactAlarmPrompt(options: {
    notifier: TimerNotifier;
    t: TFunction;
}): void {
    const { notifier, t } = options;
    Alert.alert(
        t("notifications.exactAlarm.title"),
        t("notifications.exactAlarm.message"),
        [
            {
                text: t("notifications.exactAlarm.later"),
                style: "cancel",
            },
            {
                text: t("notifications.exactAlarm.open"),
                onPress: () => {
                    void notifier.openExactAlarmSettings();
                },
            },
        ],
    );
}
