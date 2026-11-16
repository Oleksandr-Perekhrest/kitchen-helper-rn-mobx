/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

// outsource dependencies
import { NewAppScreen } from "@react-native/new-app-screen";
import { View, StatusBar, StyleSheet, useColorScheme } from "react-native";
import {
    SafeAreaProvider,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

// local dependencies
import { ThemeProvider } from "./src/theme";

function App() {
    const isDarkMode = useColorScheme() === "dark";

    return (
        <ThemeProvider>
            <SafeAreaProvider>
                <StatusBar
                    barStyle={isDarkMode ? "light-content" : "dark-content"}
                />
                <AppContent />
            </SafeAreaProvider>
        </ThemeProvider>
    );
}

function AppContent() {
    const safeAreaInsets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <NewAppScreen
                templateFileName="App.tsx"
                safeAreaInsets={safeAreaInsets}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default App;
