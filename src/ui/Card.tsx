// outsource dependencies
import type { ReactNode } from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { radii, useTheme } from "../theme";

export type CardProps = {
    /** Card contents. */
    children: ReactNode;
    /**
     * When provided, the card is tappable with accessibilityRole "button".
     * Always supply an `accessibilityLabel` so screen readers can describe the action.
     */
    onPress?: () => void;
    /** Accessibility label; strongly recommended when `onPress` is provided. */
    accessibilityLabel?: string;
    /** Additional styles for the card container. */
    style?: StyleProp<ViewStyle>;
};

export function Card({
    children,
    onPress,
    accessibilityLabel,
    style,
}: CardProps) {
    const { colors } = useTheme();

    const baseStyle = [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        style,
    ];

    if (onPress !== undefined) {
        return (
            <Pressable
                onPress={onPress}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                style={({ pressed }) => [
                    ...baseStyle,
                    pressed && styles.pressed,
                ]}
            >
                {children}
            </Pressable>
        );
    }

    return <View style={baseStyle}>{children}</View>;
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: radii.lg,
        padding: 16,
        gap: 12,
    },
    pressed: {
        opacity: 0.85,
    },
});
