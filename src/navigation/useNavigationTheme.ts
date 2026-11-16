// outsource dependencies
import { useMemo } from "react";
import type { Theme } from "@react-navigation/native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";

// local dependencies
import { useTheme } from "../theme";

export function useNavigationTheme(): Theme {
    const { scheme, colors } = useTheme();

    return useMemo<Theme>(() => {
        const base = scheme === "dark" ? DarkTheme : DefaultTheme;
        return {
            ...base,
            colors: {
                primary: colors.primary,
                background: colors.background,
                card: colors.background,
                text: colors.text,
                border: colors.border,
                notification: colors.primary,
            },
            fonts: {
                regular: { fontFamily: "Manrope", fontWeight: "400" },
                medium: { fontFamily: "Manrope", fontWeight: "600" },
                bold: { fontFamily: "Manrope", fontWeight: "700" },
                heavy: { fontFamily: "Manrope", fontWeight: "800" },
            },
        };
    }, [scheme, colors]);
}
