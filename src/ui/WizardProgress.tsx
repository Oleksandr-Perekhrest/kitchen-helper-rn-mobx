// outsource dependencies
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Text } from "./Text";
import { useTheme } from "../theme";

export type WizardProgressStep = {
    key: string;
    label: string;
};

export type WizardProgressProps = {
    /** Ordered list of wizard steps. */
    steps: WizardProgressStep[];
    /** Zero-based index of the currently active step. */
    currentIndex: number;
    /** Pre-formatted counter string rendered by the caller (e.g. "2 з 4"). */
    counterLabel: string;
    /** Called with the step index when a pressable step is tapped. */
    onStepPress?: (index: number) => void;
    /** Returns true for steps that should be tappable. Defaults to none pressable. */
    isStepPressable?: (index: number) => boolean;
};

export function WizardProgress({
    steps,
    currentIndex,
    counterLabel,
    onStepPress,
    isStepPressable,
}: WizardProgressProps) {
    const { colors } = useTheme();

    return (
        <View>
            <View style={styles.counterRow}>
                <Text
                    variant="label"
                    tone="textMuted"
                    style={styles.counterLabel}
                >
                    {counterLabel}
                </Text>
            </View>
            <View role="tablist" style={styles.stepsRow}>
                {steps.map((step, index) => {
                    const isActive = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const pressable = isStepPressable?.(index) ?? false;
                    const barColor = isActive ? colors.primary : colors.border;

                    const labelStyle = isCurrent
                        ? styles.stepLabelCurrent
                        : styles.stepLabelOther;
                    const labelColor = isCurrent
                        ? colors.text
                        : colors.textMuted;

                    const inner = (
                        <>
                            <View
                                style={[
                                    styles.bar,
                                    { backgroundColor: barColor },
                                ]}
                            />
                            <Text style={[labelStyle, { color: labelColor }]}>
                                {step.label}
                            </Text>
                        </>
                    );

                    if (pressable) {
                        return (
                            <Pressable
                                key={step.key}
                                role="tab"
                                aria-selected={isCurrent}
                                aria-label={step.label}
                                onPress={() => onStepPress?.(index)}
                                style={styles.stepPressable}
                            >
                                {inner}
                            </Pressable>
                        );
                    }

                    return (
                        <View
                            key={step.key}
                            role="tab"
                            aria-selected={isCurrent}
                            aria-label={step.label}
                            aria-disabled={true}
                            style={styles.step}
                        >
                            {inner}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    counterRow: {
        alignItems: "flex-end",
        marginBottom: 8,
    },
    counterLabel: {
        fontWeight: "700",
    },
    stepsRow: {
        flexDirection: "row",
        gap: 6,
    },
    step: {
        flex: 1,
        gap: 6,
    },
    stepPressable: {
        flex: 1,
        gap: 6,
        minHeight: 44,
        justifyContent: "flex-start",
    },
    bar: {
        height: 6,
        borderRadius: 3,
    },
    stepLabelCurrent: {
        fontFamily: "Manrope",
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "800",
    },
    stepLabelOther: {
        fontFamily: "Manrope",
        fontSize: 12,
        lineHeight: 16,
        fontWeight: "600",
    },
});
