// outsource dependencies
import type { TextStyle } from "react-native";

export const typography = {
    display: {
        fontFamily: "Manrope",
        fontSize: 30,
        fontWeight: "800",
        lineHeight: 36,
    },
    title: {
        fontFamily: "Manrope",
        fontSize: 22,
        fontWeight: "700",
        lineHeight: 28,
    },
    headline: {
        fontFamily: "Manrope",
        fontSize: 18,
        fontWeight: "700",
        lineHeight: 24,
    },
    body: {
        fontFamily: "Manrope",
        fontSize: 16,
        fontWeight: "400",
        lineHeight: 24,
    },
    label: {
        fontFamily: "Manrope",
        fontSize: 14,
        fontWeight: "600",
        lineHeight: 20,
    },
    caption: {
        fontFamily: "Manrope",
        fontSize: 13,
        fontWeight: "600",
        lineHeight: 18,
    },
    step: {
        fontFamily: "Manrope",
        fontSize: 28,
        fontWeight: "600",
        lineHeight: 36,
    },
    timer: {
        fontFamily: "Manrope",
        fontSize: 56,
        fontWeight: "800",
        lineHeight: 64,
        fontVariant: ["tabular-nums"],
    },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;
