// outsource dependencies
import type { ElementRef } from "react";
import type { TextInput } from "react-native";
import { X, Check } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { Controller, useFormContext } from "react-hook-form";

// local dependencies
import type { TimerKind } from "../../theme";
import type { RecipeFormValues } from "../../domain/recipeForm";
import { Text, TextField, IconButton, TimerKindPicker } from "../../ui";

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

            <TimerKindPicker
                value={watchedTimerKind}
                onChange={(kind) =>
                    setValue(`steps.${stepIndex}.timerKind`, kind, {
                        shouldDirty: true,
                    })
                }
                accessibilityLabel={t("timers.new.kindLabel")}
            />

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
});
