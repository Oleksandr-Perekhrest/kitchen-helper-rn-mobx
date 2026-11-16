// outsource dependencies
import { useState } from "react";
import { StatusBar } from "react-native";
import { observer } from "mobx-react-lite";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// local dependencies
import { useTheme, ThemeProvider } from "./src/theme";
import { createRootStore } from "./src/stores/RootStore";
import { createMmkvStorage } from "./src/storage/mmkvStorage";
import { RootNavigator } from "./src/navigation/RootNavigator";
import { useStores, StoreProvider } from "./src/stores/StoreProvider";
import { useNavigationTheme } from "./src/navigation/useNavigationTheme";

function AppShell() {
    const { scheme } = useTheme();
    const navTheme = useNavigationTheme();
    return (
        <>
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
    return (
        <ThemeProvider preference={settings.themePreference}>
            <SafeAreaProvider>
                <AppShell />
            </SafeAreaProvider>
        </ThemeProvider>
    );
});

function App() {
    const [store] = useState(() => createRootStore(createMmkvStorage()));
    return (
        <StoreProvider store={store}>
            <ThemedApp />
        </StoreProvider>
    );
}

export default App;
