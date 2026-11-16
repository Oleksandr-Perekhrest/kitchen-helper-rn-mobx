// outsource dependencies
import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import type { Preview, Decorator } from "@storybook/react-native-web-vite";

// local dependencies
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
    const preference = context.globals.theme === "dark" ? "dark" : "light";
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
        viewport: { value: "cookalong", isRotated: false },
    },
    parameters: {
        layout: "fullscreen",
        viewport: {
            options: {
                ...INITIAL_VIEWPORTS,
                cookalong: {
                    name: "Cookalong · 390×844",
                    styles: { width: "390px", height: "844px" },
                    type: "mobile",
                },
            },
        },
    },
    decorators: [withTheme],
    tags: ["autodocs"],
};

export default preview;
