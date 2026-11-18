// outsource dependencies
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { useTheme } from "../theme";
import type { TimerKind } from "../theme";
import { TIMER_ICONS } from "./timerIcons";

export type TimerBadgeProps = {
    kind: TimerKind;
    timeLabel: string;
    kindLabel?: string;
    onPress?: () => void;
    accessibilityLabel?: string;
};

export function TimerBadge({
    kind,
    timeLabel,
    kindLabel,
    onPress,
    accessibilityLabel,
}: TimerBadgeProps) {
    const { colors } = useTheme();
    const timerColor = colors.timer[kind];
    const displayText =
        kindLabel !== undefined ? `${kindLabel} · ${timeLabel}` : timeLabel;

    if (onPress !== undefined) {
        return (
            <Pressable
                role="button"
                aria-label={accessibilityLabel}
                onPress={onPress}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={[styles.badge, { borderColor: timerColor }]}
            >
                <Icon icon={TIMER_ICONS[kind]} size={14} color={timerColor} />
                <Text variant="caption" style={{ color: timerColor }}>
                    {displayText}
                </Text>
            </Pressable>
        );
    }

    return (
        <View style={[styles.badge, { borderColor: timerColor }]}>
            <Icon icon={TIMER_ICONS[kind]} size={14} color={timerColor} />
            <Text variant="caption" style={{ color: timerColor }}>
                {displayText}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        height: 28,
        paddingHorizontal: 10,
        borderRadius: 14,
        borderWidth: 1,
        alignSelf: "flex-start",
    },
});
