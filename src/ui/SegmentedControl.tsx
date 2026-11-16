// outsource dependencies
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Text } from "./Text";
import { shadows, useTheme } from "../theme";

export type SegmentedControlProps<T> = {
    /** Options to display. */
    options: ReadonlyArray<{ value: T; label: string }>;
    /** Currently selected value. */
    value: T;
    /** Called when the user selects a different option. */
    onChange: (next: T) => void;
    /** Required accessibility label for the radio group. */
    accessibilityLabel: string;
};

export function SegmentedControl<T>({
    options,
    value,
    onChange,
    accessibilityLabel,
}: SegmentedControlProps<T>) {
    const { colors } = useTheme();

    return (
        <View
            role="radiogroup"
            aria-label={accessibilityLabel}
            style={[styles.container, { backgroundColor: colors.surfaceAlt }]}
        >
            {options.map((option) => {
                const isSelected = option.value === value;
                return (
                    <Pressable
                        key={String(option.value)}
                        onPress={() => onChange(option.value)}
                        role="radio"
                        aria-checked={isSelected}
                        style={[
                            styles.segment,
                            isSelected && {
                                backgroundColor: colors.surface,
                                boxShadow: shadows.subtle,
                            },
                        ]}
                    >
                        <Text
                            variant="buttonSm"
                            tone="text"
                            style={
                                !isSelected ? styles.unselectedText : undefined
                            }
                        >
                            {option.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        padding: 4,
        borderRadius: 14,
        gap: 4,
    },
    segment: {
        flex: 1,
        height: 44,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    unselectedText: {
        fontWeight: "600",
    },
});
