// outsource dependencies
import { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Play, Pause, Square, RotateCcw } from "lucide-react-native";
import {
    View,
    Easing,
    Animated,
    Platform,
    Pressable,
    StyleSheet,
} from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import type { TimerKind } from "../theme";
import { TIMER_ICONS } from "./timerIcons";
import { useTheme, withAlpha } from "../theme";
import { useReduceMotion } from "../hooks/useReduceMotion";

export type StepTimerCardProps = {
    kind: TimerKind;
    kindLabel: string;
    timeText: string;
    status: "idle" | "running" | "paused" | "done";
    /**
     * When set and `status === "done"`, the Stop button fills from the left
     * over `autoStopMs` ms, and `onStop()` is called once when it reaches
     * the end. Pressing Stop earlier cancels the countdown.
     */
    autoStopMs?: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onRestart: () => void;
    onStop: () => void;
    onAdjust: (deltaMinutes: number) => void;
};

const STOP_RADIUS = 28;
const CONTAINER_RADIUS = 24;

export function StepTimerCard({
    kind,
    kindLabel,
    timeText,
    status,
    autoStopMs,
    onStart,
    onPause,
    onResume,
    onRestart,
    onStop,
    onAdjust,
}: StepTimerCardProps) {
    const { t } = useTranslation();
    const { colors, scheme } = useTheme();
    const reduceMotion = useReduceMotion();
    const timerColor = colors.timer[kind];
    const timerIcon = TIMER_ICONS[kind];

    const fill = useRef(new Animated.Value(0)).current;
    const pulse = useRef(new Animated.Value(0)).current;
    const onStopRef = useRef(onStop);
    onStopRef.current = onStop;
    const stoppedRef = useRef(false);

    const autoActive = status === "done" && autoStopMs !== undefined;
    const pulseActive = status === "done" && autoStopMs === undefined;

    useEffect(() => {
        if (status !== "done" || autoStopMs === undefined) {
            fill.setValue(0);
            stoppedRef.current = false;
            return;
        }
        stoppedRef.current = false;
        fill.setValue(0);

        const fire = () => {
            if (stoppedRef.current) return;
            stoppedRef.current = true;
            onStopRef.current();
        };

        if (reduceMotion) {
            const stepMs = Math.max(1, Math.floor(autoStopMs / 3));
            const t1 = setTimeout(() => fill.setValue(1 / 3), stepMs);
            const t2 = setTimeout(() => fill.setValue(2 / 3), stepMs * 2);
            const t3 = setTimeout(() => {
                fill.setValue(1);
                fire();
            }, autoStopMs);
            return () => {
                clearTimeout(t1);
                clearTimeout(t2);
                clearTimeout(t3);
                fill.setValue(0);
            };
        }

        const anim = Animated.timing(fill, {
            toValue: 1,
            duration: autoStopMs,
            easing: Easing.linear,
            useNativeDriver: Platform.OS !== "web",
        });
        anim.start(({ finished }) => {
            if (finished) fire();
        });
        return () => {
            anim.stop();
            fill.setValue(0);
        };
    }, [status, autoStopMs, reduceMotion, fill]);

    useEffect(() => {
        if (!pulseActive) {
            pulse.setValue(0);
            return;
        }
        if (reduceMotion) {
            pulse.setValue(1);
            return;
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulse, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: Platform.OS !== "web",
                }),
                Animated.timing(pulse, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: Platform.OS !== "web",
                }),
            ]),
        );
        loop.start();
        return () => {
            loop.stop();
            pulse.setValue(0);
        };
    }, [pulseActive, reduceMotion, pulse]);

    const handleStop = () => {
        if (autoActive) {
            if (stoppedRef.current) return;
            stoppedRef.current = true;
        }
        onStop();
    };

    const stopLabel =
        status === "done" && autoStopMs !== undefined
            ? t("cookingMode.timer.stopAuto", {
                  seconds: Math.ceil(autoStopMs / 1000),
              })
            : t("cookingMode.timer.stop");

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
    const pulseColor = withAlpha(timerColor, scheme === "dark" ? 0.22 : 0.14);

    return (
        <View
            style={[
                styles.container,
                styles.activeColumn,
                styles.activeBorder,
                styles.activeClip,
                { backgroundColor: colors.surface, borderColor: timerColor },
            ]}
        >
            {pulseActive && (
                <Animated.View
                    pointerEvents="none"
                    style={[
                        styles.pulseOverlay,
                        { backgroundColor: pulseColor, opacity: pulse },
                    ]}
                />
            )}
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
                            onPress={handleStop}
                            aria-label={stopLabel}
                            style={({ pressed }) => [
                                styles.actionOutline,
                                { borderColor: colors.border },
                                pressed && styles.pressed,
                            ]}
                        >
                            {autoActive && (
                                <Animated.View
                                    pointerEvents="none"
                                    style={[
                                        styles.autoStopFill,
                                        {
                                            backgroundColor: withAlpha(
                                                timerColor,
                                                0.35,
                                            ),
                                            transform: [{ scaleX: fill }],
                                        },
                                    ]}
                                />
                            )}
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
        borderRadius: CONTAINER_RADIUS,
        padding: 16,
    },
    idleBorder: {
        borderWidth: 1,
    },
    activeBorder: {
        borderWidth: 2,
    },
    activeClip: {
        overflow: "hidden",
    },
    pulseOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: CONTAINER_RADIUS,
        pointerEvents: "none",
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
        borderRadius: STOP_RADIUS,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    actionOutline: {
        flex: 1,
        height: 56,
        borderRadius: STOP_RADIUS,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
    },
    actionFull: {
        flex: 1,
        height: 56,
        borderRadius: STOP_RADIUS,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
    },
    autoStopFill: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: STOP_RADIUS,
        transformOrigin: "left",
        pointerEvents: "none",
    },
    pressed: {
        opacity: 0.85,
    },
});
