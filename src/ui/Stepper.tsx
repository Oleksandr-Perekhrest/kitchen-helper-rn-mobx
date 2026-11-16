// outsource dependencies
import { Plus, Minus } from "lucide-react-native";
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { useTheme } from "../theme";

export type StepperProps = {
    /** Current value. */
    value: number;
    /** Called with the new value when changed. */
    onChange: (next: number) => void;
    /** Minimum value. Defaults to 1. */
    min?: number;
    /** Maximum value. Defaults to 99. */
    max?: number;
    /** Step size. Defaults to 1. */
    step?: number;
    /** Accessibility label for the control (e.g. "Порції"). */
    accessibilityLabel: string;
    /** Formats the displayed value. Defaults to `String`. */
    formatValue?: (value: number) => string;
};

export function Stepper({
    value,
    onChange,
    min = 1,
    max = 99,
    step = 1,
    accessibilityLabel,
    formatValue = String,
}: StepperProps) {
    const { colors } = useTheme();

    const atMin = value <= min;
    const atMax = value >= max;

    function decrement() {
        if (!atMin) onChange(Math.max(value - step, min));
    }

    function increment() {
        if (!atMax) onChange(Math.min(value + step, max));
    }

    return (
        <View
            accessible={true}
            accessibilityRole="adjustable"
            aria-label={accessibilityLabel}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={value}
            aria-valuetext={formatValue(value)}
            accessibilityActions={[
                { name: "increment" },
                { name: "decrement" },
            ]}
            onAccessibilityAction={({ nativeEvent: { actionName } }) => {
                if (actionName === "increment") increment();
                if (actionName === "decrement") decrement();
            }}
            style={[
                styles.container,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            <View
                style={styles.inner}
                importantForAccessibility="no-hide-descendants"
            >
                <Pressable
                    onPress={decrement}
                    disabled={atMin}
                    style={[styles.button, atMin && styles.buttonDisabled]}
                >
                    <Icon icon={Minus} tone="primary" />
                </Pressable>
                <Text
                    variant="label"
                    numberOfLines={1}
                    style={styles.valueText}
                >
                    {formatValue(value)}
                </Text>
                <Pressable
                    onPress={increment}
                    disabled={atMax}
                    style={[styles.button, atMax && styles.buttonDisabled]}
                >
                    <Icon icon={Plus} tone="primary" />
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 44,
        borderRadius: 22,
        borderWidth: 1,
        overflow: "hidden",
    },
    inner: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
    },
    button: {
        width: 44,
        height: 42,
        alignItems: "center",
        justifyContent: "center",
    },
    buttonDisabled: {
        opacity: 0.4,
    },
    valueText: {
        textAlign: "center",
        minWidth: 48,
        paddingHorizontal: 8,
    },
});
