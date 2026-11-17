// outsource dependencies
import { X } from "lucide-react-native";
import type { TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";
import type { FieldArrayWithId } from "react-hook-form";
import type { ElementRef, MutableRefObject } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import type { TextInputSelectionChangeEvent } from "react-native";
import { Controller, useFormState, useFormContext } from "react-hook-form";

// local dependencies
import { useTheme } from "../../theme";
import { TimerEditor } from "./TimerEditor";
import type { TimerKind } from "../../theme";
import { formatDuration } from "../../i18n/formatDuration";
import { Text, Icon, TextField, IconButton, TimerBadge } from "../../ui";
import { isFormErrorKey, unlinkIngredient } from "../../domain/recipeForm";
import type {
    RecipeFormValues,
    RecipeFormIngredient,
} from "../../domain/recipeForm";

const BADGE_SIZE = 28;

const TIMER_KIND_KEYS = {
    boil: "timerKinds.boil",
    fry: "timerKinds.fry",
    stew: "timerKinds.stew",
    bake: "timerKinds.bake",
    other: "timerKinds.other",
} as const;

export type InsertTrigger = {
    stepId: string;
    cursor: number;
    version: number;
};

type Props = {
    field: FieldArrayWithId<RecipeFormValues, "steps", "_key">;
    index: number;
    isLast: boolean;
    canDelete: boolean;
    isEditingTimer: boolean;
    watchedTimerMinutes: string;
    watchedTimerKind: TimerKind;
    watchedIngredientIds: string[];
    ingredientMap: Map<string, RecipeFormIngredient>;
    insertTrigger: InsertTrigger | null;
    selectionMapRef: MutableRefObject<
        Map<string, { start: number; end: number }>
    >;
    timerMinRefMap: MutableRefObject<Map<string, ElementRef<typeof TextInput>>>;
    onActivate: () => void;
    onDelete: () => void;
    onOpenTimerEditor: () => void;
    onSaveTimer: () => Promise<void>;
    onRemoveTimer: () => void;
};

export function StepCard({
    field,
    index,
    isLast,
    canDelete,
    isEditingTimer,
    watchedTimerMinutes,
    watchedTimerKind,
    watchedIngredientIds,
    ingredientMap,
    insertTrigger,
    selectionMapRef,
    timerMinRefMap,
    onActivate,
    onDelete,
    onOpenTimerEditor,
    onSaveTimer,
    onRemoveTimer,
}: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { control, setValue, getValues } = useFormContext<RecipeFormValues>();
    const { errors } = useFormState<RecipeFormValues>({ control });

    const textInputRef = useRef<ElementRef<typeof TextInput> | null>(null);
    const [controlledSelection, setControlledSelection] = useState<
        { start: number; end: number } | undefined
    >();
    const needsSelectionRelease = useRef(false);

    useEffect(() => {
        if (insertTrigger === null || insertTrigger.stepId !== field.id) return;
        needsSelectionRelease.current = true;
        setControlledSelection({
            start: insertTrigger.cursor,
            end: insertTrigger.cursor,
        });
        textInputRef.current?.focus();
    }, [insertTrigger, field.id]);

    const stepNum = index + 1;
    const hasTimer = watchedTimerMinutes.trim() !== "";

    const stepErrors = errors.steps?.[index];
    const rawTextError = stepErrors?.text?.message;
    const translatedTextError =
        rawTextError !== undefined && isFormErrorKey(rawTextError)
            ? t(rawTextError)
            : undefined;

    const rawTimerError = stepErrors?.timerMinutes?.message;
    const translatedTimerError =
        rawTimerError !== undefined && isFormErrorKey(rawTimerError)
            ? t(rawTimerError)
            : undefined;

    const linkedIngredients = watchedIngredientIds
        .map((id) => ingredientMap.get(id))
        .filter((i): i is RecipeFormIngredient => i !== undefined);

    function handleSelectionChange(e: TextInputSelectionChangeEvent) {
        selectionMapRef.current.set(field.id, e.nativeEvent.selection);
        if (needsSelectionRelease.current) {
            needsSelectionRelease.current = false;
            setControlledSelection(undefined);
        }
    }

    return (
        <Pressable key={field._key} onPress={onActivate} style={styles.card}>
            {/* Header: badge + "Step N" + delete */}
            <View style={styles.cardHeader}>
                <View
                    style={[
                        styles.stepBadge,
                        { backgroundColor: colors.primarySoft },
                    ]}
                >
                    <Text variant="caption" tone="primary">
                        {String(stepNum)}
                    </Text>
                </View>
                <Text variant="label" style={styles.stepTitle}>
                    {t("recipeForm.stepsEditor.stepN", { n: stepNum })}
                </Text>
                {canDelete && (
                    <IconButton
                        icon={X}
                        variant="ghost"
                        accessibilityLabel={t(
                            "recipeForm.stepsEditor.deleteStepA11y",
                            { n: stepNum },
                        )}
                        onPress={onDelete}
                    />
                )}
            </View>

            {/* Step text */}
            <Controller
                name={`steps.${index}.text`}
                control={control}
                render={({ field: textField }) => (
                    <TextField
                        ref={(r) => {
                            textInputRef.current = r;
                            const rhfRef = textField.ref as (
                                r: ElementRef<typeof TextInput> | null,
                            ) => void;
                            if (typeof rhfRef === "function") rhfRef(r);
                        }}
                        value={textField.value}
                        onChangeText={textField.onChange}
                        onBlur={textField.onBlur}
                        onFocus={onActivate}
                        onSelectionChange={handleSelectionChange}
                        selection={controlledSelection}
                        multiline
                        numberOfLines={2}
                        aria-label={t("recipeForm.stepsEditor.stepDescA11y", {
                            n: stepNum,
                        })}
                        placeholder={t(
                            "recipeForm.stepsEditor.stepDescPlaceholder",
                        )}
                        error={translatedTextError}
                    />
                )}
            />

            {/* Linked ingredient chips */}
            {linkedIngredients.length > 0 && (
                <View style={styles.linkedRow}>
                    {linkedIngredients.map((ingredient) => (
                        <View
                            key={ingredient.id}
                            style={[
                                styles.linkedChip,
                                {
                                    backgroundColor: colors.surfaceAlt,
                                    borderColor: colors.borderStrong,
                                },
                            ]}
                        >
                            <Text variant="caption">{ingredient.name}</Text>
                            <Pressable
                                role="button"
                                aria-label={t(
                                    "recipeForm.stepsEditor.unlinkA11y",
                                    { name: ingredient.name },
                                )}
                                onPress={() => {
                                    const currentStep = getValues(
                                        `steps.${index}`,
                                    );
                                    const updated = unlinkIngredient(
                                        currentStep,
                                        ingredient.id,
                                    );
                                    setValue(
                                        `steps.${index}.ingredientIds`,
                                        updated.ingredientIds,
                                        { shouldDirty: true },
                                    );
                                }}
                                style={styles.unlinkButton}
                            >
                                <Icon icon={X} size={12} tone="textMuted" />
                            </Pressable>
                        </View>
                    ))}
                </View>
            )}

            {/* Static timer plaque */}
            {!isEditingTimer && hasTimer && (
                <TimerBadge
                    kind={watchedTimerKind}
                    timeLabel={formatDuration(
                        t,
                        parseInt(watchedTimerMinutes.trim(), 10),
                    )}
                    kindLabel={t(TIMER_KIND_KEYS[watchedTimerKind])}
                    onPress={onOpenTimerEditor}
                    accessibilityLabel={t(
                        "recipeForm.stepsEditor.editTimerPlaqueA11y",
                        {
                            kind: t(TIMER_KIND_KEYS[watchedTimerKind]),
                            n: parseInt(watchedTimerMinutes.trim(), 10),
                        },
                    )}
                />
            )}

            {/* Timer editor */}
            {isEditingTimer && (
                <TimerEditor
                    stepIndex={index}
                    stepNum={stepNum}
                    watchedTimerKind={watchedTimerKind}
                    translatedTimerError={translatedTimerError}
                    onTimerMinRef={(r) => {
                        if (r !== null) {
                            timerMinRefMap.current.set(field.id, r);
                        } else {
                            timerMinRefMap.current.delete(field.id);
                        }
                    }}
                    onSave={onSaveTimer}
                    onRemove={onRemoveTimer}
                />
            )}

            {/* Add timer button */}
            {!isEditingTimer && !hasTimer && (
                <Pressable
                    role="button"
                    onPress={onOpenTimerEditor}
                    style={styles.textButton}
                >
                    <Text variant="label" tone="primary">
                        {t("recipeForm.stepsEditor.addTimer")}
                    </Text>
                </Pressable>
            )}

            {/* Divider (not after last card) */}
            {!isLast && (
                <View
                    style={[
                        styles.groupDivider,
                        { backgroundColor: colors.border },
                    ]}
                />
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: { gap: 10 },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    stepBadge: {
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        borderRadius: BADGE_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    stepTitle: { flex: 1 },
    linkedRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 6,
    },
    linkedChip: {
        flexDirection: "row",
        alignItems: "center",
        height: 28,
        paddingLeft: 10,
        paddingRight: 6,
        borderRadius: 14,
        borderWidth: 1,
        gap: 4,
    },
    unlinkButton: {
        width: 20,
        height: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    textButton: {
        alignSelf: "flex-start",
        paddingVertical: 4,
    },
    groupDivider: {
        height: StyleSheet.hairlineWidth,
        marginTop: 8,
        marginBottom: 8,
    },
});
