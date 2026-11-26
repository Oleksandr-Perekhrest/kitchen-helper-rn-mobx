// outsource dependencies
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { View, StatusBar, StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// local dependencies
import { useTheme, ThemeProvider } from "./src/theme";
import { resolveLanguage } from "./src/i18n/resolveLanguage";
import { SnackbarHost } from "./src/components/SnackbarHost";
import { createMmkvStorage } from "./src/storage/mmkvStorage";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { deleteUnreferencedPhotos } from "./src/storage/photos";
import { i18n, initI18n, getDeviceLanguages } from "./src/i18n";
import { subscribeToOpens } from "./src/notifications/openEvents";
import { resolveOpenTarget } from "./src/notifications/openTarget";
import { useStores, StoreProvider } from "./src/stores/StoreProvider";
import { applyNativeColorScheme } from "./src/theme/nativeColorScheme";
import { useNavigationTheme } from "./src/navigation/useNavigationTheme";
import { showExactAlarmPrompt } from "./src/notifications/exactAlarmPrompt";
import { createRootStore, referencedPhotoFiles } from "./src/stores/RootStore";
import { createNotifyKitNotifier } from "./src/notifications/notifyKitNotifier";
import { startTimerNotificationsSync } from "./src/stores/timerNotificationsSync";
import {
    openTarget,
    navigationRef,
    flushPendingTarget,
} from "./src/navigation/navigationRef";

function AppShell() {
    const { scheme } = useTheme();
    const navTheme = useNavigationTheme();
    return (
        <View style={styles.shell}>
            {/* Matters on Android; on iOS the status bar follows the native color scheme. */}
            <StatusBar
                barStyle={scheme === "dark" ? "light-content" : "dark-content"}
            />
            <NavigationContainer
                ref={navigationRef}
                theme={navTheme}
                onReady={flushPendingTarget}
            >
                <RootNavigator />
            </NavigationContainer>
            <SnackbarHost />
        </View>
    );
}

const styles = StyleSheet.create({
    shell: { flex: 1 },
});

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
            quietChannelName: i18n.t("notifications.quietChannelName"),
            silentChannelName: i18n.t("notifications.silentChannelName"),
            ongoingChannelName: i18n.t("notifications.ongoingChannelName"),
        });
        // The app root never unmounts, so the dispose function is not kept.
        startTimerNotificationsSync({
            t: i18n.t,
            notifier,
            timers: s.timers,
            recipes: s.recipes,
            settings: s.settings,
            startupCancelIds: s.startupCancelIds,
            onExactAlarmsDenied: () =>
                showExactAlarmPrompt({ notifier, t: i18n.t }),
        });
        void deleteUnreferencedPhotos(referencedPhotoFiles(s));
        // The app root never unmounts, so the dispose function is not kept.
        subscribeToOpens((timerId) => {
            openTarget(resolveOpenTarget(timerId, s.timers, s.recipes));
            if (timerId === undefined) return;
            const timer = s.timers.get(timerId);
            if (timer === undefined) return;
            if (timer.endsAt !== null && timer.endsAt <= Date.now()) {
                void notifier.cancel(timerId);
            }
        });
        return s;
    });
    useEffect(() => () => store.dispose(), [store]);
    return (
        <StoreProvider store={store}>
            <ThemedApp />
        </StoreProvider>
    );
}

export default App;
