// outsource dependencies
import type { LucideIcon } from "lucide-react-native";
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { useTheme } from "../theme";
import type { TextTone } from "./Text";

export const ICON_BUTTON_VARIANTS = ["subtle", "elevated", "ghost"] as const;

export type IconButtonVariant = (typeof ICON_BUTTON_VARIANTS)[number];

export type IconButtonProps = {
    /** Lucide icon to render inside the button. */
    icon: LucideIcon;
    /** Accessibility label — required because there is no visible text. */
    accessibilityLabel: string;
    /** Press handler. */
    onPress: () => void;
    /** Visual style. Defaults to `"subtle"`. */
    variant?: IconButtonVariant;
    /** Button size. `"md"` = 44 px / icon 22, `"lg"` = 52 px / icon 24. Defaults to `"md"`. */
    size?: "md" | "lg";
    /** Override the variant's default icon color with a semantic tone. */
    iconTone?: TextTone;
    /** Badge count shown when > 0. Appended to the accessibility label, e.g. "Timers, 3". */
    badge?: number;
    /** Whether the button is disabled. */
    disabled?: boolean;
};

type VariantStyle = {
    backgroundColor: string;
    boxShadow?: string;
    iconTone: TextTone;
};

export function IconButton({
    icon,
    accessibilityLabel,
    onPress,
    variant = "subtle",
    size = "md",
    iconTone,
    badge = 0,
    disabled = false,
}: IconButtonProps) {
    const { colors, shadows } = useTheme();

    const variantMap: Record<IconButtonVariant, VariantStyle> = {
        subtle: {
            backgroundColor: colors.surfaceAlt,
            iconTone: "text",
        },
        elevated: {
            backgroundColor: colors.surface,
            boxShadow: shadows.raised,
            iconTone: "text",
        },
        ghost: {
            backgroundColor: "transparent",
            iconTone: "textMuted",
        },
    };

    const {
        backgroundColor,
        boxShadow,
        iconTone: defaultIconTone,
    } = variantMap[variant];
    const resolvedIconTone = iconTone ?? defaultIconTone;
    const isLg = size === "lg";
    const iconSize = isLg ? 24 : 22;

    const a11yLabel =
        badge > 0 ? `${accessibilityLabel}, ${badge}` : accessibilityLabel;

    return (
        <Pressable
            disabled={disabled}
            onPress={onPress}
            role="button"
            aria-label={a11yLabel}
            aria-disabled={disabled}
            style={({ pressed }) => [
                styles.base,
                isLg ? styles.sizeLg : styles.sizeMd,
                { backgroundColor },
                boxShadow !== undefined ? { boxShadow } : null,
                pressed && !disabled && styles.pressed,
                disabled && styles.disabled,
            ]}
        >
            <Icon
                icon={icon}
                size={iconSize}
                tone={resolvedIconTone}
                strokeWidth={2}
            />
            {badge > 0 && (
                <View
                    style={[styles.badge, { backgroundColor: colors.primary }]}
                >
                    <Text
                        variant="caption"
                        tone="onPrimary"
                        style={styles.badgeText}
                    >
                        {String(badge)}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    base: {
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 9999,
    },
    sizeMd: {
        width: 44,
        height: 44,
    },
    sizeLg: {
        width: 52,
        height: 52,
    },
    pressed: {
        opacity: 0.85,
    },
    disabled: {
        opacity: 0.4,
    },
    badge: {
        position: "absolute",
        top: -2,
        right: -2,
        minWidth: 20,
        height: 20,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: "800",
    },
});
