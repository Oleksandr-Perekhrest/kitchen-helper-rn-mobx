// outsource dependencies
import { Appearance } from "react-native";

// local dependencies
import type { ThemePreference } from "./ThemeProvider";

/**
 * Native UI (iOS status bar via react-native-screens, navigation bar glass,
 * keyboard, system dialogs) follows this override, not our ThemeProvider.
 */
export function applyNativeColorScheme(preference: ThemePreference): void {
    if (preference === "system") {
        Appearance.setColorScheme("auto");
    } else {
        Appearance.setColorScheme(preference);
    }
}
