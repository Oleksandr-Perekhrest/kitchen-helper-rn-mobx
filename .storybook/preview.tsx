// outsource dependencies
import { useEffect } from "react";
import type { ReactNode } from "react";
import { View, StyleSheet } from "react-native";
import { I18nextProvider } from "react-i18next";
import { INITIAL_VIEWPORTS } from "storybook/viewport";
import type { Preview, Decorator } from "@storybook/react-native-web-vite";

// local dependencies
import storybookI18n from "./i18n";
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

function LocaleWrapper({
    locale,
    children,
}: {
    locale: string;
    children: ReactNode;
}) {
    useEffect(() => {
        void storybookI18n.changeLanguage(locale);
    }, [locale]);
    return <I18nextProvider i18n={storybookI18n}>{children}</I18nextProvider>;
}

const withLocale: Decorator = (Story, context) => {
    const rawLocale = context.globals.locale;
    const locale = rawLocale === "uk" ? "uk" : "en";
    return (
        <LocaleWrapper locale={locale}>
            <Story />
        </LocaleWrapper>
    );
};

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
        locale: {
            description: "Active locale for components",
            toolbar: {
                title: "Locale",
                icon: "globe",
                items: ["en", "uk"],
                dynamicTitle: true,
            },
        },
    },
    initialGlobals: {
        theme: "light",
        locale: "en",
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
    decorators: [withLocale, withTheme],
    tags: ["autodocs"],
};

export default preview;
