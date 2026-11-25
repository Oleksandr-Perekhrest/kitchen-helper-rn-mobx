// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { Icon } from "./Icon";
import { Text } from "./Text";
import type { TimerKind } from "../theme";
import { TIMER_ICONS } from "./timerIcons";
import { useTheme, TIMER_KINDS } from "../theme";

type Props = {
    value: TimerKind;
    onChange: (kind: TimerKind) => void;
    accessibilityLabel: string;
};

export type TimerKindPickerProps = Props;

export function TimerKindPicker({
    value,
    onChange,
    accessibilityLabel,
}: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();

    return (
        <View
            role="radiogroup"
            aria-label={accessibilityLabel}
            style={styles.row}
        >
            {TIMER_KINDS.map((kind) => {
                const isSelected = value === kind;
                return (
                    <Pressable
                        key={kind}
                        role="radio"
                        aria-label={t(`timerKinds.${kind}`)}
                        aria-checked={isSelected}
                        onPress={() => onChange(kind)}
                        style={styles.item}
                    >
                        <View
                            style={[
                                styles.circle,
                                isSelected
                                    ? { backgroundColor: colors.timer[kind] }
                                    : [
                                          styles.circleUnselected,
                                          {
                                              backgroundColor: colors.surface,
                                              borderColor: colors.borderStrong,
                                          },
                                      ],
                            ]}
                        >
                            <Icon
                                icon={TIMER_ICONS[kind]}
                                size={22}
                                color={
                                    isSelected
                                        ? colors.onPrimary
                                        : colors.timer[kind]
                                }
                                strokeWidth={2}
                            />
                        </View>
                        <Text
                            tone={isSelected ? "text" : "textMuted"}
                            style={[
                                styles.label,
                                isSelected
                                    ? styles.labelSelected
                                    : styles.labelUnselected,
                            ]}
                        >
                            {t(`timerKinds.${kind}`)}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: { flexDirection: "row" },
    item: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    circle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    circleUnselected: { borderWidth: 1 },
    label: {
        fontSize: 12,
        textAlign: "center",
    },
    labelSelected: { fontWeight: "700" },
    labelUnselected: { fontWeight: "600" },
});
