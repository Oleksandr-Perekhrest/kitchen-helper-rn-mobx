// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, Pressable, StyleSheet } from "react-native";
import { Play, Pause, Square, RotateCcw } from "lucide-react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { useTheme } from "../theme";
import type { TimerKind } from "../theme";
import { TIMER_ICONS } from "./timerIcons";

export type StepTimerCardProps = {
    kind: TimerKind;
    kindLabel: string;
    timeText: string;
    status: "idle" | "running" | "paused" | "done";
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onRestart: () => void;
    onStop: () => void;
    onAdjust: (deltaMinutes: number) => void;
};

export function StepTimerCard({
    kind,
    kindLabel,
    timeText,
    status,
    onStart,
    onPause,
    onResume,
    onRestart,
    onStop,
    onAdjust,
}: StepTimerCardProps) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const timerColor = colors.timer[kind];
    const timerIcon = TIMER_ICONS[kind];

    if (status === "idle") {
        return (
            <View
                style={[
                    styles.container,
                    styles.idleBorder,
                    styles.idleColumn,
                    {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                    },
                ]}
            >
                <View
                    accessible={true}
                    aria-label={`${kindLabel}, ${timeText}`}
                    style={styles.kindRow}
                >
                    <Icon
                        icon={timerIcon}
                        size={18}
                        color={timerColor}
                        strokeWidth={2}
                    />
                    <Text variant="buttonSm" style={{ color: timerColor }}>
                        {kindLabel}
                    </Text>
                </View>
                <View style={styles.idleRow}>
                    <Text
                        aria-hidden={true}
                        variant="timer"
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.6}
                        style={styles.idleTime}
                    >
                        {timeText}
                    </Text>
                    <Pressable
                        role="button"
                        onPress={onStart}
                        aria-label={t("cookingMode.timer.start")}
                        style={({ pressed }) => [
                            styles.startButton,
                            { backgroundColor: timerColor },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Icon
                            icon={Play}
                            size={22}
                            color={colors.onPrimary}
                            strokeWidth={2}
                        />
                        <Text
                            variant="buttonSm"
                            style={{ color: colors.onPrimary }}
                        >
                            {t("cookingMode.timer.start")}
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

    const statusKey =
        status === "running"
            ? "cookingMode.timer.running"
            : status === "paused"
              ? "cookingMode.timer.paused"
              : "cookingMode.timer.done";
    const statusText = t(statusKey);
    const headerLabel = `${kindLabel}, ${statusText}, ${timeText}`;

    return (
        <View
            style={[
                styles.container,
                styles.activeColumn,
                styles.activeBorder,
                { backgroundColor: colors.surface, borderColor: timerColor },
            ]}
        >
            <View
                accessible={true}
                aria-label={headerLabel}
                style={styles.activeHeader}
            >
                <View aria-hidden={true} style={styles.kindRow}>
                    <Icon
                        icon={timerIcon}
                        size={18}
                        color={timerColor}
                        strokeWidth={2}
                    />
                    <Text variant="buttonSm" style={{ color: timerColor }}>
                        {kindLabel}
                    </Text>
                </View>
                <Text
                    aria-hidden={true}
                    tone="textMuted"
                    style={styles.statusText}
                >
                    {statusText}
                </Text>
            </View>

            <View
                style={[
                    styles.middleRow,
                    status === "done" && styles.middleRowDone,
                ]}
            >
                {status !== "done" && (
                    <Pressable
                        role="button"
                        aria-label={t("cookingMode.timer.minusMinute")}
                        onPress={() => onAdjust(-1)}
                        style={({ pressed }) => [
                            styles.adjButton,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.surface,
                            },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.adjLabel}>{"−1"}</Text>
                    </Pressable>
                )}
                <Text
                    aria-hidden={true}
                    variant="timer"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.6}
                    style={styles.middleTime}
                >
                    {timeText}
                </Text>
                {status !== "done" && (
                    <Pressable
                        role="button"
                        aria-label={t("cookingMode.timer.plusMinute")}
                        onPress={() => onAdjust(1)}
                        style={({ pressed }) => [
                            styles.adjButton,
                            {
                                borderColor: colors.border,
                                backgroundColor: colors.surface,
                            },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Text style={styles.adjLabel}>{"+1"}</Text>
                    </Pressable>
                )}
            </View>

            <View style={styles.bottomRow}>
                {status === "running" ? (
                    <Pressable
                        role="button"
                        onPress={onPause}
                        aria-label={t("cookingMode.timer.pause")}
                        style={({ pressed }) => [
                            styles.actionFull,
                            { backgroundColor: timerColor },
                            pressed && styles.pressed,
                        ]}
                    >
                        <Icon
                            icon={Pause}
                            size={22}
                            color={colors.onPrimary}
                            strokeWidth={2}
                        />
                        <Text
                            variant="buttonSm"
                            style={{ color: colors.onPrimary }}
                        >
                            {t("cookingMode.timer.pause")}
                        </Text>
                    </Pressable>
                ) : (
                    <>
                        <Pressable
                            role="button"
                            onPress={status === "paused" ? onResume : onRestart}
                            aria-label={
                                status === "paused"
                                    ? t("cookingMode.timer.resume")
                                    : t("cookingMode.timer.restart")
                            }
                            style={({ pressed }) => [
                                styles.actionPrimary,
                                { backgroundColor: timerColor },
                                pressed && styles.pressed,
                            ]}
                        >
                            <Icon
                                icon={status === "paused" ? Play : RotateCcw}
                                size={22}
                                color={colors.onPrimary}
                                strokeWidth={2}
                            />
                            <Text
                                variant="buttonSm"
                                style={{ color: colors.onPrimary }}
                            >
                                {status === "paused"
                                    ? t("cookingMode.timer.resume")
                                    : t("cookingMode.timer.restart")}
                            </Text>
                        </Pressable>
                        <Pressable
                            role="button"
                            onPress={onStop}
                            aria-label={t("cookingMode.timer.stop")}
                            style={({ pressed }) => [
                                styles.actionOutline,
                                { borderColor: colors.border },
                                pressed && styles.pressed,
                            ]}
                        >
                            <Icon
                                icon={Square}
                                size={22}
                                tone="text"
                                strokeWidth={2}
                            />
                        </Pressable>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        padding: 16,
    },
    idleBorder: {
        borderWidth: 1,
    },
    activeBorder: {
        borderWidth: 2,
    },
    idleColumn: {
        gap: 4,
    },
    idleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    idleTime: {
        flex: 1,
        flexShrink: 1,
    },
    kindRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    startButton: {
        height: 60,
        paddingHorizontal: 22,
        borderRadius: 30,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    activeColumn: {
        gap: 14,
    },
    activeHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    statusText: {
        fontSize: 13,
        fontWeight: "700",
        lineHeight: 18,
    },
    middleRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    middleRowDone: {
        justifyContent: "center",
    },
    middleTime: {
        flexShrink: 1,
        textAlign: "center",
    },
    adjButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    adjLabel: {
        fontSize: 16,
        fontWeight: "800",
    },
    bottomRow: {
        flexDirection: "row",
        gap: 8,
    },
    actionPrimary: {
        flex: 2,
        height: 56,
        borderRadius: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    actionOutline: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    actionFull: {
        flex: 1,
        height: 56,
        borderRadius: 28,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    pressed: {
        opacity: 0.85,
    },
});
