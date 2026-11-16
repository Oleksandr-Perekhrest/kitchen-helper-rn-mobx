// outsource dependencies
import { StatusBar } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";

// local dependencies
import { useTheme, ThemeProvider } from "./src/theme";
import { RootNavigator } from "./src/navigation/RootNavigator";
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

function App() {
    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <AppShell />
            </SafeAreaProvider>
        </ThemeProvider>
    );
}

export default App;
