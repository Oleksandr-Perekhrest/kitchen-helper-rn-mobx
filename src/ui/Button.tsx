// outsource dependencies
import { Pressable, StyleSheet } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import type { StyleProp, ViewStyle } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import type { TextTone } from "./Text";
import { radii, useTheme } from "../theme";

export const BUTTON_VARIANTS = [
    "primary",
    "secondary",
    "soft",
    "neutral",
    "danger",
] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export type ButtonProps = {
    /** Button label text. */
    label: string;
    /** Press handler. */
    onPress: () => void;
    /** Visual style of the button. Defaults to `"primary"`. */
    variant?: ButtonVariant;
    /** Button size. Defaults to `"lg"`. */
    size?: "lg" | "md";
    /** Optional leading Lucide icon. */
    icon?: LucideIcon;
    /** Whether the button is disabled. */
    disabled?: boolean;
    /** Additional container styles. */
    style?: StyleProp<ViewStyle>;
};

type VariantStyle = {
    backgroundColor: string;
    borderColor?: string;
    borderWidth: number;
    tone: TextTone;
};

export function Button({
    label,
    onPress,
    variant = "primary",
    size = "lg",
    icon,
    disabled = false,
    style,
}: ButtonProps) {
    const { colors } = useTheme();

    const variantMap: Record<ButtonVariant, VariantStyle> = {
        primary: {
            backgroundColor: colors.primary,
            borderWidth: 0,
            tone: "onPrimary",
        },
        secondary: {
            backgroundColor: "transparent",
            borderColor: colors.primary,
            borderWidth: 2,
            tone: "primary",
        },
        soft: {
            backgroundColor: colors.primarySoft,
            borderWidth: 0,
            tone: "primary",
        },
        neutral: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            tone: "text",
        },
        danger: {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderWidth: 1,
            tone: "danger",
        },
    };

    const { backgroundColor, borderColor, borderWidth, tone } =
        variantMap[variant];

    const isLg = size === "lg";
    const iconSize = isLg ? 22 : 18;
    const textVariant = isLg ? "button" : "buttonSm";

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ disabled }}
            style={({ pressed }) => [
                styles.base,
                isLg ? styles.sizeLg : styles.sizeMd,
                { backgroundColor, borderColor, borderWidth },
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            {icon && (
                <Icon icon={icon} size={iconSize} tone={tone} strokeWidth={2} />
            )}
            <Text variant={textVariant} tone={tone}>
                {label}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        borderRadius: radii.full,
    },
    sizeLg: {
        height: 56,
        paddingHorizontal: 24,
    },
    sizeMd: {
        height: 44,
        paddingHorizontal: 16,
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.4,
    },
});
