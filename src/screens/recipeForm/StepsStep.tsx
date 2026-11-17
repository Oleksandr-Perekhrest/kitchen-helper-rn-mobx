// outsource dependencies
import { X } from "lucide-react-native";
import type { Ref, ElementRef } from "react";
import type { TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
    Controller,
    useFormState,
    useFieldArray,
    useFormContext,
} from "react-hook-form";

// local dependencies
import type { TimerKind } from "../../theme";
import { TIMER_ICONS } from "../../ui/timerIcons";
import { useTheme, TIMER_KINDS } from "../../theme";
import { formatDuration } from "../../i18n/formatDuration";
import { Text, Icon, TextField, IconButton } from "../../ui";
import type {
    RecipeFormValues,
    RecipeFormIngredient,
} from "../../domain/recipeForm";
import {
    emptyStep,
    isFormErrorKey,
    unlinkIngredient,
} from "../../domain/recipeForm";

type TextInputRef = Ref<ElementRef<typeof TextInput>>;

const BADGE_SIZE = 28;

export function StepsStep() {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const { control, setValue, getValues, setFocus } =
        useFormContext<RecipeFormValues>();
    const { errors } = useFormState<RecipeFormValues>({ control });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "steps",
        keyName: "_key",
    });

    const [activeStepId, setActiveStepId] = useState<string | undefined>(
        () => fields[0]?.id,
    );
    const [timerEditorIds, setTimerEditorIds] = useState<ReadonlySet<string>>(
        new Set(),
    );

    const pendingFocusIndex = useRef(-1);
    const pendingTimerFocusId = useRef<string | null>(null);
    const timerMinRefMap = useRef<Map<string, ElementRef<typeof TextInput>>>(
        new Map(),
    );

    useEffect(() => {
        const idx = pendingFocusIndex.current;
        if (idx >= 0 && idx < fields.length) {
            setFocus(`steps.${idx}.text`);
            pendingFocusIndex.current = -1;
        }
    }, [fields.length, setFocus]);

    useEffect(() => {
        const id = pendingTimerFocusId.current;
        if (id !== null) {
            const ref = timerMinRefMap.current.get(id);
            if (ref !== undefined) {
                ref.focus();
                pendingTimerFocusId.current = null;
            }
        }
    });

    // toNestErrors puts path ["steps"] error in .root when item-level errors
    // coexist, or directly in .message when the array is empty and no item names exist.
    const rawListError = errors.steps?.root?.message ?? errors.steps?.message;
    const listError =
        rawListError !== undefined && isFormErrorKey(rawListError)
            ? t(rawListError)
            : undefined;

    function handleAddStep() {
        const step = emptyStep();
        pendingFocusIndex.current = fields.length;
        append(step);
        setActiveStepId(step.id);
    }

    function handleDelete(index: number) {
        const field = fields[index];
        if (field === undefined) return;
        remove(index);
        if (field.id === activeStepId) {
            const remaining = fields.filter((_, i) => i !== index);
            setActiveStepId(remaining[0]?.id);
        }
        setTimerEditorIds((prev) => {
            const next = new Set(prev);
            next.delete(field.id);
            return next;
        });
    }

    function handleAddTimer(stepId: string) {
        setTimerEditorIds((prev) => new Set([...prev, stepId]));
        pendingTimerFocusId.current = stepId;
    }

    function handleRemoveTimer(index: number, stepId: string) {
        setValue(`steps.${index}.timerMinutes`, "", { shouldDirty: true });
        setValue(`steps.${index}.timerKind`, "other", { shouldDirty: true });
        setTimerEditorIds((prev) => {
            const next = new Set(prev);
            next.delete(stepId);
            return next;
        });
    }

    const ingredients = getValues("ingredients");
    const ingredientMap = new Map<string, RecipeFormIngredient>(
        ingredients.map((i) => [i.id, i]),
    );

    return (
        <View style={styles.container}>
            {/* TODO: ingredient cloud will go here (next task) */}

            {fields.length > 0 && (
                <View>
                    {fields.map((field, index) => {
                        const isActive = field.id === activeStepId;
                        const stepNum = index + 1;
                        const hasTimer = field.timerMinutes.trim() !== "";
                        const showTimerEditor =
                            isActive &&
                            (hasTimer || timerEditorIds.has(field.id));
                        const stepErrors = errors.steps?.[index];

                        const rawTextError = stepErrors?.text?.message;
                        const translatedTextError =
                            rawTextError !== undefined &&
                            isFormErrorKey(rawTextError)
                                ? t(rawTextError)
                                : undefined;

                        const rawTimerError = stepErrors?.timerMinutes?.message;
                        const translatedTimerError =
                            rawTimerError !== undefined &&
                            isFormErrorKey(rawTimerError)
                                ? t(rawTimerError)
                                : undefined;

                        const linkedIngredients = field.ingredientIds
                            .map((id) => ingredientMap.get(id))
                            .filter(
                                (i): i is RecipeFormIngredient =>
                                    i !== undefined,
                            );

                        const timerKind: TimerKind = field.timerKind;

                        return (
                            <Pressable
                                key={field._key}
                                onPress={() => setActiveStepId(field.id)}
                                style={styles.card}
                            >
                                {/* Header: badge + "Step N" + delete */}
                                <View style={styles.cardHeader}>
                                    <View
                                        style={[
                                            styles.stepBadge,
                                            {
                                                backgroundColor:
                                                    colors.primarySoft,
                                            },
                                        ]}
                                    >
                                        <Text variant="caption" tone="primary">
                                            {String(stepNum)}
                                        </Text>
                                    </View>
                                    <Text
                                        variant="label"
                                        style={styles.stepTitle}
                                    >
                                        {t("recipeForm.stepsEditor.stepN", {
                                            n: stepNum,
                                        })}
                                    </Text>
                                    {fields.length > 1 && (
                                        <IconButton
                                            icon={X}
                                            variant="ghost"
                                            accessibilityLabel={t(
                                                "recipeForm.stepsEditor.deleteStepA11y",
                                                { n: stepNum },
                                            )}
                                            onPress={() => handleDelete(index)}
                                        />
                                    )}
                                </View>

                                {/* Step text */}
                                <Controller
                                    name={`steps.${index}.text`}
                                    control={control}
                                    render={({ field: textField }) => (
                                        <TextField
                                            ref={textField.ref as TextInputRef}
                                            value={textField.value}
                                            onChangeText={textField.onChange}
                                            onBlur={textField.onBlur}
                                            onFocus={() =>
                                                setActiveStepId(field.id)
                                            }
                                            multiline
                                            numberOfLines={2}
                                            aria-label={t(
                                                "recipeForm.stepsEditor.stepDescA11y",
                                                { n: stepNum },
                                            )}
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
                                                        backgroundColor:
                                                            colors.surfaceAlt,
                                                        borderColor:
                                                            colors.borderStrong,
                                                    },
                                                ]}
                                            >
                                                <Text variant="caption">
                                                    {ingredient.name}
                                                </Text>
                                                <Pressable
                                                    role="button"
                                                    aria-label={t(
                                                        "recipeForm.stepsEditor.unlinkA11y",
                                                        {
                                                            name: ingredient.name,
                                                        },
                                                    )}
                                                    onPress={() => {
                                                        const currentStep =
                                                            getValues(
                                                                `steps.${index}`,
                                                            );
                                                        const updated =
                                                            unlinkIngredient(
                                                                currentStep,
                                                                ingredient.id,
                                                            );
                                                        setValue(
                                                            `steps.${index}.ingredientIds`,
                                                            updated.ingredientIds,
                                                            {
                                                                shouldDirty: true,
                                                            },
                                                        );
                                                    }}
                                                    style={styles.unlinkButton}
                                                >
                                                    <Icon
                                                        icon={X}
                                                        size={12}
                                                        tone="textMuted"
                                                    />
                                                </Pressable>
                                            </View>
                                        ))}
                                    </View>
                                )}

                                {/* Static timer plaque (not active, has timer) — same visual as RecipeScreen */}
                                {!isActive && hasTimer && (
                                    <View
                                        style={[
                                            styles.timerPlaque,
                                            {
                                                borderColor:
                                                    colors.timer[timerKind],
                                            },
                                        ]}
                                    >
                                        <Icon
                                            icon={TIMER_ICONS[timerKind]}
                                            size={14}
                                            color={colors.timer[timerKind]}
                                        />
                                        <Text
                                            variant="caption"
                                            style={{
                                                color: colors.timer[timerKind],
                                            }}
                                        >
                                            {formatDuration(
                                                t,
                                                parseInt(
                                                    field.timerMinutes.trim(),
                                                    10,
                                                ),
                                            )}
                                        </Text>
                                    </View>
                                )}

                                {/* Timer editor (active + has timer or editor opened) */}
                                {showTimerEditor && (
                                    <View style={styles.timerEditor}>
                                        <View style={styles.timerEditorHeader}>
                                            <Text variant="label">
                                                {t(
                                                    "recipeForm.stepsEditor.timerEditorLabel",
                                                    {
                                                        kind: t(
                                                            `timerKinds.${timerKind}` as "timerKinds.boil",
                                                        ),
                                                    },
                                                )}
                                            </Text>
                                        </View>
                                        <View style={styles.timerMinRow}>
                                            <Controller
                                                name={`steps.${index}.timerMinutes`}
                                                control={control}
                                                render={({
                                                    field: timerMinField,
                                                }) => (
                                                    <TextField
                                                        ref={(r) => {
                                                            if (r !== null) {
                                                                timerMinRefMap.current.set(
                                                                    field.id,
                                                                    r,
                                                                );
                                                            } else {
                                                                timerMinRefMap.current.delete(
                                                                    field.id,
                                                                );
                                                            }
                                                            const rhfRef =
                                                                timerMinField.ref as TextInputRef;
                                                            if (
                                                                typeof rhfRef ===
                                                                "function"
                                                            ) {
                                                                rhfRef(r);
                                                            }
                                                        }}
                                                        value={
                                                            timerMinField.value
                                                        }
                                                        onChangeText={
                                                            timerMinField.onChange
                                                        }
                                                        onBlur={
                                                            timerMinField.onBlur
                                                        }
                                                        keyboardType="number-pad"
                                                        aria-label={t(
                                                            "recipeForm.stepsEditor.timerMinutesA11y",
                                                            { n: stepNum },
                                                        )}
                                                        style={
                                                            styles.timerMinField
                                                        }
                                                    />
                                                )}
                                            />
                                            <Text
                                                variant="label"
                                                tone="textMuted"
                                            >
                                                {t(
                                                    "recipeForm.stepsEditor.timerMin",
                                                )}
                                            </Text>
                                            <View
                                                role="radiogroup"
                                                style={styles.timerKindsRow}
                                            >
                                                {TIMER_KINDS.map((kind) => (
                                                    <Pressable
                                                        key={kind}
                                                        role="radio"
                                                        aria-label={t(
                                                            `timerKinds.${kind}` as "timerKinds.boil",
                                                        )}
                                                        aria-checked={
                                                            timerKind === kind
                                                        }
                                                        onPress={() =>
                                                            setValue(
                                                                `steps.${index}.timerKind`,
                                                                kind,
                                                                {
                                                                    shouldDirty: true,
                                                                },
                                                            )
                                                        }
                                                        style={
                                                            styles.timerKindButton
                                                        }
                                                    >
                                                        <Icon
                                                            icon={
                                                                TIMER_ICONS[
                                                                    kind
                                                                ]
                                                            }
                                                            size={22}
                                                            color={
                                                                colors.timer[
                                                                    kind
                                                                ]
                                                            }
                                                            strokeWidth={2}
                                                        />
                                                    </Pressable>
                                                ))}
                                            </View>
                                        </View>
                                        {translatedTimerError !== undefined && (
                                            <Text
                                                variant="caption"
                                                tone="danger"
                                            >
                                                {translatedTimerError}
                                            </Text>
                                        )}
                                        <Pressable
                                            role="button"
                                            onPress={() =>
                                                handleRemoveTimer(
                                                    index,
                                                    field.id,
                                                )
                                            }
                                            style={styles.textButton}
                                        >
                                            <Text variant="label" tone="danger">
                                                {t(
                                                    "recipeForm.stepsEditor.removeTimer",
                                                )}
                                            </Text>
                                        </Pressable>
                                    </View>
                                )}

                                {/* Add timer button (active, no timer, editor not open) */}
                                {isActive &&
                                    !hasTimer &&
                                    !timerEditorIds.has(field.id) && (
                                        <Pressable
                                            role="button"
                                            onPress={() =>
                                                handleAddTimer(field.id)
                                            }
                                            style={styles.textButton}
                                        >
                                            <Text
                                                variant="label"
                                                tone="primary"
                                            >
                                                {t(
                                                    "recipeForm.stepsEditor.addTimer",
                                                )}
                                            </Text>
                                        </Pressable>
                                    )}

                                {/* Divider (not after last card) */}
                                {index < fields.length - 1 && (
                                    <View
                                        style={[
                                            styles.groupDivider,
                                            {
                                                backgroundColor: colors.border,
                                            },
                                        ]}
                                    />
                                )}
                            </Pressable>
                        );
                    })}
                </View>
            )}

            {/* List-level error + Add step */}
            <View style={styles.addSection}>
                {listError !== undefined && (
                    <Text variant="caption" tone="danger">
                        {listError}
                    </Text>
                )}
                <Pressable
                    role="button"
                    onPress={handleAddStep}
                    style={[styles.addButton, { borderColor: colors.primary }]}
                >
                    <Text variant="label" tone="primary">
                        {t("recipeForm.stepsEditor.addStep")}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginTop: 24,
    },
    card: {
        gap: 10,
    },
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
    stepTitle: {
        flex: 1,
    },
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
    timerPlaque: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        height: 28,
        paddingHorizontal: 10,
        borderRadius: 14,
        borderWidth: 1,
        alignSelf: "flex-start",
    },
    timerEditor: {
        gap: 10,
    },
    timerEditorHeader: {
        flexDirection: "row",
        alignItems: "center",
    },
    timerMinRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    timerMinField: {
        width: 80,
    },
    timerKindsRow: {
        flex: 1,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    timerKindButton: {
        width: 44,
        height: 44,
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
    addSection: {
        gap: 8,
    },
    addButton: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
    },
});
