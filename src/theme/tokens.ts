export type TimerKind = "boil" | "fry" | "stew" | "bake" | "other";

export type ThemeColors = {
    background: string;
    surface: string;
    surfaceAlt: string;
    border: string;
    text: string;
    textMuted: string;
    primary: string;
    onPrimary: string;
    primarySoft: string;
    danger: string;
    timer: Record<TimerKind, string>;
};

export const lightColors = {
    background: "#F6F7F3",
    surface: "#FFFFFF",
    surfaceAlt: "#E7ECE4",
    border: "#D9E0D5",
    text: "#1E2A23",
    textMuted: "#5A6860",
    primary: "#2F6B4F",
    onPrimary: "#FFFFFF",
    primarySoft: "#DCEBD8",
    danger: "#B42318",
    timer: {
        boil: "#2563A8",
        fry: "#B83A2E",
        stew: "#9A6700",
        bake: "#7A4FA0",
        other: "#2F6B4F",
    },
} satisfies ThemeColors;

export const darkColors = {
    background: "#28322C",
    surface: "#35413A",
    surfaceAlt: "#43514A",
    border: "#5D6C64",
    text: "#F7FAF5",
    textMuted: "#D2DCD5",
    primary: "#9BE0BA",
    onPrimary: "#0F2A1C",
    primarySoft: "#3A5A46",
    danger: "#FFA99D",
    timer: {
        boil: "#7DB3F0",
        fry: "#F08A7E",
        stew: "#E8B84A",
        bake: "#C3A0E6",
        other: "#9BE0BA",
    },
} satisfies ThemeColors;

export const spacing = {
    4: 4,
    8: 8,
    12: 12,
    16: 16,
    20: 20,
    24: 24,
    32: 32,
} as const;

export const radii = {
    sm: 10,
    md: 14,
    lg: 18,
    full: 28,
} as const;

export const shadows = {
    raised: "0px 2px 8px rgba(30, 42, 35, 0.15)",
} as const;
