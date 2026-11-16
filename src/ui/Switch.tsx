// outsource dependencies
import { useRef, useEffect } from "react";
import {
    Easing,
    Platform,
    Animated,
    Pressable,
    StyleSheet,
} from "react-native";

// local dependencies
import { shadows, useTheme } from "../theme";

export type SwitchProps = {
    /** Current value of the switch. */
    value: boolean;
    /** Called when the switch is toggled. */
    onValueChange: (next: boolean) => void;
    /** Required accessibility label for screen readers. */
    accessibilityLabel: string;
    /** Whether the switch is disabled. */
    disabled?: boolean;
};

export function Switch({
    value,
    onValueChange,
    accessibilityLabel,
    disabled = false,
}: SwitchProps) {
    const { colors } = useTheme();
    const translateX = useRef(new Animated.Value(value ? 20 : 0)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: value ? 20 : 0,
            duration: 180,
            easing: Easing.out(Easing.quad),
            useNativeDriver: Platform.OS !== "web",
        }).start();
    }, [value, translateX]);

    return (
        <Pressable
            onPress={() => onValueChange(!value)}
            disabled={disabled}
            role="switch"
            aria-checked={value}
            aria-disabled={disabled}
            aria-label={accessibilityLabel}
            style={[
                styles.track,
                {
                    backgroundColor: value
                        ? colors.primary
                        : colors.borderStrong,
                },
                disabled && styles.disabled,
            ]}
        >
            <Animated.View
                style={[
                    styles.thumb,
                    {
                        backgroundColor: colors.surface,
                        boxShadow: shadows.subtle,
                        transform: [{ translateX }],
                    },
                ]}
            />
        </Pressable>
    );
}

const styles = StyleSheet.create({
    track: {
        width: 52,
        height: 32,
        borderRadius: 16,
        justifyContent: "center",
    },
    thumb: {
        width: 26,
        height: 26,
        borderRadius: 13,
        marginLeft: 3,
    },
    disabled: {
        opacity: 0.4,
    },
});
