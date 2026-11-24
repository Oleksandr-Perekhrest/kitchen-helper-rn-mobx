// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, Pressable, StyleSheet } from "react-native";
import { Play, Pause, Trash2, RotateCcw } from "lucide-react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import { useTheme } from "../theme";
import { IconButton } from "./IconButton";
import type { TimerKind } from "../theme";
import { TIMER_ICONS } from "./timerIcons";

export type TimerCardProps = {
    kind: TimerKind;
    kindLabel: string;
    title: string;
    subtitle: string;
    timeText: string;
    status: "running" | "paused" | "done";
    onPause: () => void;
    onResume: () => void;
    onRestart: () => void;
    onAdjust: (deltaMinutes: number) => void;
    onDelete: () => void;
    onOpen?: () => void;
};

export function TimerCard({
    kind,
    kindLabel,
    title,
    subtitle,
    timeText,
    status,
    onPause,
    onResume,
    onRestart,
    onAdjust,
    onDelete,
    onOpen,
}: TimerCardProps) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const timerColor = colors.timer[kind];
    const timerIcon = TIMER_ICONS[kind];

    const doneText = t("cookingMode.timer.done");
    const headerAriaLabel =
        onOpen !== undefined
            ? `${t("timers.card.open")} ${title}`
            : `${kindLabel}, ${title}, ${timeText}`;

    const headerContent = (
        <>
            <Icon
                icon={timerIcon}
                size={22}
                color={timerColor}
                strokeWidth={2}
            />
            <View style={styles.titleColumn}>
                <View style={styles.titleRow}>
                    <Text
                        variant="headline"
                        numberOfLines={1}
                        style={styles.title}
                    >
                        {title}
                    </Text>
                    {status === "done" && (
                        <Text
                            variant="caption"
                            tone="textMuted"
                            style={styles.statusText}
                        >
                            {doneText}
                        </Text>
                    )}
                </View>
                <Text
                    variant="caption"
                    tone="textMuted"
                    numberOfLines={1}
                    style={styles.subtitle}
                >
                    {subtitle}
                </Text>
            </View>
            <Text
                aria-hidden={true}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}
                style={styles.timeText}
            >
                {timeText}
            </Text>
        </>
    );

    const header =
        onOpen !== undefined ? (
            <Pressable
                role="button"
                aria-label={headerAriaLabel}
                onPress={onOpen}
                style={({ pressed }) => [
                    styles.headerRow,
                    pressed && styles.pressed,
                ]}
            >
                {headerContent}
            </Pressable>
        ) : (
            <View
                accessible={true}
                aria-label={headerAriaLabel}
                style={styles.headerRow}
            >
                {headerContent}
            </View>
        );

    const primaryLabel =
        status === "running"
            ? t("cookingMode.timer.pause")
            : status === "paused"
              ? t("cookingMode.timer.resume")
              : t("cookingMode.timer.restart");
    const primaryIcon =
        status === "running" ? Pause : status === "paused" ? Play : RotateCcw;
    const primaryOnPress =
        status === "running"
            ? onPause
            : status === "paused"
              ? onResume
              : onRestart;

    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
        >
            {header}
            <View style={styles.bottomRow}>
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
                <Pressable
                    role="button"
                    aria-label={primaryLabel}
                    onPress={primaryOnPress}
                    style={({ pressed }) => [
                        styles.primaryAction,
                        { backgroundColor: timerColor },
                        pressed && styles.pressed,
                    ]}
                >
                    <Icon
                        icon={primaryIcon}
                        size={22}
                        color={colors.onPrimary}
                        strokeWidth={2}
                    />
                    <Text
                        variant="buttonSm"
                        style={{ color: colors.onPrimary }}
                    >
                        {primaryLabel}
                    </Text>
                </Pressable>
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
                <IconButton
                    icon={Trash2}
                    variant="ghost"
                    accessibilityLabel={t("timers.card.delete")}
                    onPress={onDelete}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 16,
        gap: 14,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    titleColumn: {
        flex: 1,
        gap: 2,
    },
    titleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    title: {
        flexShrink: 1,
    },
    subtitle: {
        flexShrink: 1,
    },
    statusText: {
        fontWeight: "700",
    },
    timeText: {
        fontFamily: "Manrope",
        fontSize: 28,
        fontWeight: "800",
        fontVariant: ["tabular-nums"],
    },
    bottomRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
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
    primaryAction: {
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
