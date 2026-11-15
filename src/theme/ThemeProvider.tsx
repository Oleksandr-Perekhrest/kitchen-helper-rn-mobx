// outsource dependencies
import { useColorScheme } from "react-native";
import { useMemo, useContext, createContext } from "react";

// local dependencies
import type { ThemeColors } from "./tokens";
import { radii, spacing, darkColors, lightColors } from "./tokens";

export type ThemePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

export type Theme = {
    scheme: ColorScheme;
    colors: ThemeColors;
    spacing: typeof spacing;
    radii: typeof radii;
};

type ThemeContextValue = Theme;

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
    preference?: ThemePreference;
    children: React.ReactNode;
};

export function ThemeProvider({
    preference = "system",
    children,
}: ThemeProviderProps) {
    const systemScheme = useColorScheme();

    const scheme: ColorScheme = useMemo(() => {
        if (preference === "light") return "light";
        if (preference === "dark") return "dark";
        if (systemScheme === "dark") {
            return "dark";
        }
        return "light";
    }, [preference, systemScheme]);

    const value = useMemo<Theme>(
        () => ({
            scheme,
            colors: scheme === "dark" ? darkColors : lightColors,
            spacing,
            radii,
        }),
        [scheme],
    );

    return (
        <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
    );
}

export function useTheme(): Theme {
    const ctx = useContext(ThemeContext);
    if (ctx === null) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return ctx;
}
