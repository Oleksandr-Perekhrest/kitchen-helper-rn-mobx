// outsource dependencies
import type { ReactNode } from "react";
import { useColorScheme } from "react-native";
import { useMemo, useContext, createContext } from "react";

// local dependencies
import { typography } from "./typography";
import type { ThemeColors } from "./tokens";
import { radii, spacing, shadows, darkColors, lightColors } from "./tokens";

export type ThemePreference = "system" | "light" | "dark";
export type ColorScheme = "light" | "dark";

export type Theme = {
    scheme: ColorScheme;
    colors: ThemeColors;
    spacing: typeof spacing;
    radii: typeof radii;
    shadows: typeof shadows;
    typography: typeof typography;
};

const ThemeContext = createContext<Theme | null>(null);

type ThemeProviderProps = {
    preference?: ThemePreference;
    children: ReactNode;
};

export function ThemeProvider({
    preference = "system",
    children,
}: ThemeProviderProps) {
    const systemScheme = useColorScheme();
    const scheme: ColorScheme =
        preference === "system"
            ? systemScheme === "dark"
                ? "dark"
                : "light"
            : preference;

    const value = useMemo<Theme>(
        () => ({
            scheme,
            colors: scheme === "dark" ? darkColors : lightColors,
            spacing,
            radii,
            shadows,
            typography,
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
