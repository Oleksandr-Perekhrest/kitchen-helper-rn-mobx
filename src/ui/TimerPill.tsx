// outsource dependencies
import { useRef, useEffect } from "react";
import { View, Platform, Animated, Pressable, StyleSheet } from "react-native";

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

const PILL_RADIUS = 26;

export function TimerPill({
    kind,
    timeText,
    label,
    expanded = false,
    finished = false,
    onPress,
    kindLabel,
}: TimerPillProps) {
    const { colors, scheme, shadows } = useTheme();
    const timerColor = colors.timer[kind];
    const ringOpacity = useRef(new Animated.Value(0)).current;
    const reduceMotion = useReduceMotion();

    useEffect(() => {
        if (!finished) {
            ringOpacity.setValue(0);
            return;
        }
        if (reduceMotion) {
            ringOpacity.setValue(1);
            return;
        }

        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(ringOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: Platform.OS !== "web",
                }),
                Animated.timing(ringOpacity, {
                    toValue: 0,
                    duration: 600,
                    useNativeDriver: Platform.OS !== "web",
                }),
            ]),
        );

        pulse.start();

        return () => {
            pulse.stop();
            ringOpacity.setValue(0);
        };
    }, [finished, reduceMotion, ringOpacity]);

    const tintColor = withAlpha(timerColor, scheme === "dark" ? 0.24 : 0.14);
    const baseColor = expanded
        ? colors.surface
        : withAlpha(colors.surface, 0.85);

    const ariaLabel =
        expanded && label !== undefined
            ? `${kindLabel}: ${timeText}, ${label}`
            : `${kindLabel}: ${timeText}`;

    return (
        <View style={[styles.wrapper, { boxShadow: shadows.raised }]}>
            <Pressable
                onPress={onPress}
                role="button"
                aria-label={ariaLabel}
                aria-expanded={expanded}
                style={({ pressed }) => [
                    styles.pill,
                    { backgroundColor: baseColor },
                    pressed && styles.pressed,
                    expanded && styles.expanded,
                ]}
            >
                <View style={[styles.tint, { backgroundColor: tintColor }]} />
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
                {finished && (
                    <Animated.View
                        style={[
                            styles.ring,
                            { borderColor: timerColor, opacity: ringOpacity },
                        ]}
                    />
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        alignSelf: "flex-start",
        borderRadius: PILL_RADIUS,
    },
    pill: {
        flexDirection: "row",
        alignItems: "center",
        height: 52,
        paddingHorizontal: 14,
        borderRadius: PILL_RADIUS,
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
    tint: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: PILL_RADIUS,
        pointerEvents: "none",
    },
    ring: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: PILL_RADIUS,
        borderWidth: 2,
        pointerEvents: "none",
    },
});
