// outsource dependencies
import { StatusBar } from "react-native";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// local dependencies
import { useTheme, ThemeProvider } from "./src/theme";
import { resolveLanguage } from "./src/i18n/resolveLanguage";
import { createMmkvStorage } from "./src/storage/mmkvStorage";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { deleteUnreferencedPhotos } from "./src/storage/photos";
import { i18n, initI18n, getDeviceLanguages } from "./src/i18n";
import { useStores, StoreProvider } from "./src/stores/StoreProvider";
import { applyNativeColorScheme } from "./src/theme/nativeColorScheme";
import { useNavigationTheme } from "./src/navigation/useNavigationTheme";
import { showExactAlarmPrompt } from "./src/notifications/exactAlarmPrompt";
import { createRootStore, referencedPhotoFiles } from "./src/stores/RootStore";
import { createNotifyKitNotifier } from "./src/notifications/notifyKitNotifier";
import { startTimerNotificationsSync } from "./src/stores/timerNotificationsSync";

function AppShell() {
    const { scheme } = useTheme();
    const navTheme = useNavigationTheme();
    return (
        <>
            {/* Matters on Android; on iOS the status bar follows the native color scheme. */}
            <StatusBar
                barStyle={scheme === "dark" ? "light-content" : "dark-content"}
            />
            <NavigationContainer theme={navTheme}>
                <RootNavigator />
            </NavigationContainer>
        </>
    );
}

const ThemedApp = observer(function ThemedAppComponent() {
    const { settings } = useStores();
    useEffect(() => {
        applyNativeColorScheme(settings.themePreference);
    }, [settings.themePreference]);
    useEffect(() => {
        i18n.changeLanguage(
            resolveLanguage(settings.language, getDeviceLanguages()),
        );
    }, [settings.language]);
    return (
        <ThemeProvider preference={settings.themePreference}>
            <SafeAreaProvider>
                <AppShell />
            </SafeAreaProvider>
        </ThemeProvider>
    );
});

function App() {
    const [store] = useState(() => {
        const deviceLanguages = getDeviceLanguages();
        const s = createRootStore(createMmkvStorage(), { deviceLanguages });
        initI18n(resolveLanguage(s.settings.language, deviceLanguages));
        const notifier = createNotifyKitNotifier();
        void notifier.prepare({
            channelName: i18n.t("notifications.channelName"),
            silentChannelName: i18n.t("notifications.silentChannelName"),
        });
        // The app root never unmounts, so the dispose function is not kept.
        startTimerNotificationsSync({
            t: i18n.t,
            notifier,
            timers: s.timers,
            recipes: s.recipes,
            settings: s.settings,
            onExactAlarmsDenied: () =>
                showExactAlarmPrompt({ notifier, t: i18n.t }),
        });
        void deleteUnreferencedPhotos(referencedPhotoFiles(s));
        return s;
    });
    return (
        <StoreProvider store={store}>
            <ThemedApp />
        </StoreProvider>
    );
}

export default App;
