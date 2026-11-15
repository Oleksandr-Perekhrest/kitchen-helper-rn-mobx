// outsource dependencies
import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import type { Preview, Decorator } from "@storybook/react-native-web-vite";

// local dependencies
import type { ThemePreference } from "../src/theme";
import { useTheme, ThemeProvider } from "../src/theme";

const styles = StyleSheet.create({
    canvas: {
        flex: 1,
        padding: 16,
    },
});

function ThemedCanvas({ children }: { children: ReactNode }) {
    const { colors } = useTheme();
    return (
        <View style={[styles.canvas, { backgroundColor: colors.background }]}>
            {children}
        </View>
    );
}

const withTheme: Decorator = (Story, context) => {
    const preference = (context.globals.theme ?? "light") as ThemePreference;
    return (
        <ThemeProvider preference={preference}>
            <ThemedCanvas>
                <Story />
            </ThemedCanvas>
        </ThemeProvider>
    );
};

const preview: Preview = {
    globalTypes: {
        theme: {
            description: "Global theme for components",
            toolbar: {
                title: "Theme",
                icon: "circlehollow",
                items: ["light", "dark"],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        theme: "light",
    },
    decorators: [withTheme],
    tags: ["autodocs"],
};

export default preview;
