// outsource dependencies
import { useRef, useEffect } from "react";
import { Platform, Animated, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import type { TimerKind } from "../theme";
import { TIMER_ICONS } from "./timerIcons";
import { useTheme, withAlpha } from "../theme";
import { useReduceMotion } from "../hooks/useReduceMotion";

export type TimerPillProps = {
    /** Timer category that controls icon and accent colour. */
    kind: TimerKind;
    /** Formatted remaining time string, e.g. `"4:10"` or `"1:12:40"`. */
    timeText: string;
    /** Optional recipe step label shown when the pill is expanded. */
    label?: string;
    /** When true the pill widens to show the step label. */
    expanded?: boolean;
    /** When true the timer has reached zero; triggers pulse or border. */
    finished?: boolean;
    /** Called when the user taps the pill. */
    onPress: () => void;
    /**
     * Localized name of the timer kind (e.g. "Смажити"). The component
     * composes `aria-label` as `"${kindLabel}: ${timeText}"`, appending
     * `", ${label}"` when the pill is expanded and a label is provided.
     */
    kindLabel: string;
};

export function TimerPill({
    kind,
    timeText,
    label,
    expanded = false,
    finished = false,
    onPress,
    kindLabel,
}: TimerPillProps) {
    const { colors, scheme } = useTheme();
    const timerColor = colors.timer[kind];
    const opacity = useRef(new Animated.Value(1)).current;
    const reduceMotion = useReduceMotion();

    useEffect(() => {
        if (!finished || reduceMotion) {
            opacity.setValue(1);
            return;
        }

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.55,
                    duration: 600,
                    useNativeDriver: Platform.OS !== "web",
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: Platform.OS !== "web",
                }),
            ]),
        );

        pulse.start();

        return () => {
            pulse.stop();
            opacity.setValue(1);
        };
    }, [finished, reduceMotion, opacity]);

    const bgColor = withAlpha(timerColor, scheme === "dark" ? 0.24 : 0.14);
    const showBorder = finished && reduceMotion;

    const ariaLabel =
        expanded && label !== undefined
            ? `${kindLabel}: ${timeText}, ${label}`
            : `${kindLabel}: ${timeText}`;

    return (
        <Animated.View style={[styles.wrapper, { opacity }]}>
            <Pressable
                onPress={onPress}
                role="button"
                aria-label={ariaLabel}
                aria-expanded={expanded}
                style={({ pressed }) => [
                    styles.pill,
                    { backgroundColor: bgColor },
                    showBorder && { borderWidth: 2, borderColor: timerColor },
                    pressed && styles.pressed,
                    expanded && styles.expanded,
                ]}
            >
                <Icon
                    icon={TIMER_ICONS[kind]}
                    size={22}
                    color={timerColor}
                    strokeWidth={2}
                />
                <Text
                    variant="buttonSm"
                    tone="text"
                    numberOfLines={1}
                    style={styles.timeText}
                >
                    {timeText}
                    {expanded && label !== undefined && (
                        <Text variant="label" tone="text">
                            {" "}
                            {label}
                        </Text>
                    )}
                </Text>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: "flex-start",
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        paddingHorizontal: 14,
        borderRadius: 26,
        gap: 8,
    },
    expanded: {
        maxWidth: 280,
    },
    timeText: {
        fontSize: 17,
        fontVariant: ["tabular-nums"],
        flexShrink: 1,
    },
    pressed: {
        opacity: 0.85,
    },
});
