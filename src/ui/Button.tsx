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
    "dangerText",
] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];

export type ButtonProps = {
    /** Button label text. */
    label: string;
    /** Press handler. */
    onPress: () => void;
    /** Visual style of the button. Defaults to `"primary"`. */
    variant?: ButtonVariant;
    /** Button size. `"md"` = 44 px, `"lg"` = 56 px, `"xl"` = 76 px. Defaults to `"lg"`. */
    size?: "lg" | "md" | "xl";
    /** Optional Lucide icon. */
    icon?: LucideIcon;
    /** Where to place the icon relative to the label. Defaults to `"start"`. */
    iconPosition?: "start" | "end";
    /** Whether the button is disabled. */
    disabled?: boolean;
    /** Overrides the background colour of the `"primary"` variant. Text and icon colour stay `onPrimary`. */
    color?: string;
    /** Additional container styles. */
    style?: StyleProp<ViewStyle>;
    /** Overrides the default aria-label (which equals `label`). */
    accessibilityLabel?: string;
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
    iconPosition = "start",
    disabled = false,
    color,
    style,
    accessibilityLabel,
}: ButtonProps) {
    const { colors } = useTheme();

    const variantMap: Record<ButtonVariant, VariantStyle> = {
        primary: {
            backgroundColor: color ?? colors.primary,
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
        dangerText: {
            backgroundColor: "transparent",
            borderWidth: 0,
            tone: "danger",
        },
    };

    const { backgroundColor, borderColor, borderWidth, tone } =
        variantMap[variant];

    const isXl = size === "xl";
    const isLg = size === "lg";
    const iconSize = isXl ? 24 : isLg ? 22 : 18;
    const textVariant = isLg || isXl ? "button" : "buttonSm";
    const borderRadius = isXl ? radii.lg : radii.full;

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            role="button"
            aria-label={accessibilityLabel ?? label}
            aria-disabled={disabled}
            style={({ pressed }) => [
                styles.base,
                isXl ? styles.sizeXl : isLg ? styles.sizeLg : styles.sizeMd,
                { backgroundColor, borderColor, borderWidth, borderRadius },
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
                style,
            ]}
        >
            {icon && iconPosition === "start" && (
                <Icon icon={icon} size={iconSize} tone={tone} strokeWidth={2} />
            )}
            <Text variant={textVariant} tone={tone}>
                {label}
            </Text>
            {icon && iconPosition === "end" && (
                <Icon icon={icon} size={iconSize} tone={tone} strokeWidth={2} />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    sizeMd: {
        height: 44,
        paddingHorizontal: 16,
    },
    sizeLg: {
        height: 56,
        paddingHorizontal: 24,
    },
    sizeXl: {
        height: 76,
        paddingHorizontal: 24,
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.4,
    },
});
