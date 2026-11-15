// outsource dependencies
import { useRef, useEffect } from "react";
import {
    Platform,
    Animated,
    Pressable,
    StyleSheet,
    AccessibilityInfo,
} from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import type { TimerKind } from "../theme";
import { TIMER_ICONS } from "./timerIcons";
import { useTheme, withAlpha } from "../theme";

export type TimerPillProps = {
    kind: TimerKind;
    timeText: string;
    label?: string;
    expanded?: boolean;
    finished?: boolean;
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
    const animation = useRef<Animated.CompositeAnimation | null>(null);
    const reduceMotion = useRef(false);

    useEffect(() => {
        let mounted = true;

        AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
            if (mounted) {
                reduceMotion.current = reduced;
            }
        });

        const sub = AccessibilityInfo.addEventListener(
            "reduceMotionChanged",
            (reduced) => {
                reduceMotion.current = reduced;
                if (reduced && animation.current) {
                    animation.current.stop();
                    opacity.setValue(1);
                }
            },
        );

        return () => {
            mounted = false;
            sub.remove();
        };
    }, [opacity]);

    useEffect(() => {
        if (animation.current) {
            animation.current.stop();
            animation.current = null;
            opacity.setValue(1);
        }

        if (!finished || reduceMotion.current) {
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

        animation.current = pulse;
        pulse.start();

        return () => {
            pulse.stop();
            opacity.setValue(1);
        };
    }, [finished, opacity]);

    const bgColor = withAlpha(timerColor, scheme === "dark" ? 0.24 : 0.14);
    const showBorder = finished && reduceMotion.current;

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
                <Text variant="buttonSm" tone="text" style={styles.timeText}>
                    {timeText}
                </Text>
                {expanded && label !== undefined && (
                    <Text
                        tone="text"
                        variant="label"
                        numberOfLines={1}
                        style={styles.label}
                    >
                        {label}
                    </Text>
                )}
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
    },
    label: {
        flexShrink: 1,
    },
    pressed: {
        opacity: 0.85,
    },
});
