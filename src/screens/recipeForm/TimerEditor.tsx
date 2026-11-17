// outsource dependencies
import type { ElementRef } from "react";
import type { TextInput } from "react-native";
import { X, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View, Pressable, StyleSheet } from "react-native";
import { Controller, useFormContext } from "react-hook-form";

// local dependencies
import type { TimerKind } from "../../theme";
import { TIMER_ICONS } from "../../ui/timerIcons";
import { useTheme, TIMER_KINDS } from "../../theme";
import { Text, Icon, TextField, IconButton } from "../../ui";
import type { RecipeFormValues } from "../../domain/recipeForm";

const TIMER_KIND_KEYS = {
    boil: "timerKinds.boil",
    fry: "timerKinds.fry",
    stew: "timerKinds.stew",
    bake: "timerKinds.bake",
    other: "timerKinds.other",
} as const;

type Props = {
    stepIndex: number;
    stepNum: number;
    watchedTimerKind: TimerKind;
    translatedTimerError: string | undefined;
    onTimerMinRef: (r: ElementRef<typeof TextInput> | null) => void;
    onSave: () => Promise<void>;
    onRemove: () => void;
};

export function TimerEditor({
    stepIndex,
    stepNum,
    watchedTimerKind,
    translatedTimerError,
    onTimerMinRef,
    onSave,
    onRemove,
}: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { control, setValue } = useFormContext<RecipeFormValues>();

    return (
        <View style={styles.timerEditor}>
            <View style={styles.timerMinRow}>
                <Controller
                    name={`steps.${stepIndex}.timerMinutes`}
                    control={control}
                    render={({ field: timerMinField }) => (
                        <TextField
                            ref={(r) => {
                                onTimerMinRef(r);
                                const rhfRef = timerMinField.ref as (
                                    r: ElementRef<typeof TextInput> | null,
                                ) => void;
                                if (typeof rhfRef === "function") rhfRef(r);
                            }}
                            value={timerMinField.value}
                            onChangeText={timerMinField.onChange}
                            onBlur={timerMinField.onBlur}
                            keyboardType="number-pad"
                            aria-label={t(
                                "recipeForm.stepsEditor.timerMinutesA11y",
                                { n: stepNum },
                            )}
                            style={styles.timerMinField}
                        />
                    )}
                />
                <Text variant="label" tone="textMuted">
                    {t("recipeForm.stepsEditor.timerMin")}
                </Text>
                <View style={styles.timerMinSpacer} />
                <IconButton
                    icon={Check}
                    variant="subtle"
                    iconTone="primary"
                    accessibilityLabel={t("recipeForm.stepsEditor.saveTimer")}
                    onPress={onSave}
                />
                <IconButton
                    icon={X}
                    variant="ghost"
                    accessibilityLabel={t("recipeForm.stepsEditor.removeTimer")}
                    onPress={onRemove}
                />
            </View>

            <View role="radiogroup" style={styles.timerKindActionRow}>
                {TIMER_KINDS.map((kind) => {
                    const isSelected = watchedTimerKind === kind;
                    return (
                        <Pressable
                            key={kind}
                            role="radio"
                            aria-label={t(TIMER_KIND_KEYS[kind])}
                            aria-checked={isSelected}
                            onPress={() =>
                                setValue(`steps.${stepIndex}.timerKind`, kind, {
                                    shouldDirty: true,
                                })
                            }
                            style={styles.timerKindItem}
                        >
                            <View
                                style={[
                                    styles.timerKindCircle,
                                    isSelected
                                        ? {
                                              backgroundColor:
                                                  colors.timer[kind],
                                          }
                                        : [
                                              styles.timerKindCircleUnselected,
                                              {
                                                  backgroundColor:
                                                      colors.surface,
                                                  borderColor:
                                                      colors.borderStrong,
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
                                    styles.timerKindLabel,
                                    isSelected
                                        ? styles.timerKindLabelSelected
                                        : styles.timerKindLabelUnselected,
                                ]}
                            >
                                {t(TIMER_KIND_KEYS[kind])}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            {translatedTimerError !== undefined && (
                <Text variant="caption" tone="danger">
                    {translatedTimerError}
                </Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    timerEditor: { gap: 10 },
    timerMinRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    timerMinField: { width: 80 },
    timerMinSpacer: { flex: 1 },
    timerKindActionRow: { flexDirection: "row" },
    timerKindItem: {
        flex: 1,
        alignItems: "center",
        gap: 4,
    },
    timerKindCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    timerKindCircleUnselected: { borderWidth: 1 },
    timerKindLabel: {
        fontSize: 12,
        textAlign: "center",
    },
    timerKindLabelSelected: { fontWeight: "700" },
    timerKindLabelUnselected: { fontWeight: "600" },
});
