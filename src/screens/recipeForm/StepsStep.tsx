// outsource dependencies
import type { TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import type { RefObject, ElementRef } from "react";
import { useRef, useState, useEffect } from "react";
import { View, Pressable, StyleSheet } from "react-native";
import {
    useWatch,
    useFormState,
    useFieldArray,
    useFormContext,
} from "react-hook-form";

// local dependencies
import { Text } from "../../ui";
import { StepCard } from "./StepCard";
import { useTheme } from "../../theme";
import type { TimerKind } from "../../theme";
import { ProductCloud } from "./ProductCloud";
import { useStepsEditor } from "./StepsEditorContext";
import type { RecipeFormValues } from "../../domain/recipeForm";
import { emptyStep, isFormErrorKey } from "../../domain/recipeForm";

type Props = {
    cloudRef?: RefObject<ElementRef<typeof View> | null>;
    onCloudLayout?: () => void;
};

export function StepsStep({ cloudRef, onCloudLayout }: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const { control, setValue, getValues, setFocus, trigger, clearErrors } =
        useFormContext<RecipeFormValues>();
    const { errors } = useFormState<RecipeFormValues>({ control });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "steps",
        keyName: "_key",
    });

    const watchedSteps = useWatch({ control, name: "steps" });

    const { activeStepId, setActiveStepId } = useStepsEditor();

    const [editingTimerStepId, setEditingTimerStepId] = useState<string | null>(
        null,
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

    const rawListError = errors.steps?.root?.message ?? errors.steps?.message;
    const listError =
        rawListError !== undefined && isFormErrorKey(rawListError)
            ? t(rawListError)
            : undefined;

    const ingredientMap = new Map(
        getValues("ingredients").map((i) => [i.id, i]),
    );

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
        if (field.id === editingTimerStepId) {
            setEditingTimerStepId(null);
        }
    }

    function handleOpenTimerEditor(stepId: string) {
        setEditingTimerStepId(stepId);
        pendingTimerFocusId.current = stepId;
    }

    async function handleSaveTimer(index: number) {
        const isValid = await trigger(`steps.${index}.timerMinutes`);
        if (isValid) {
            setEditingTimerStepId(null);
        }
    }

    function handleRemoveTimer(index: number) {
        setValue(`steps.${index}.timerMinutes`, "", { shouldDirty: true });
        setValue(`steps.${index}.timerKind`, "other", { shouldDirty: true });
        clearErrors(`steps.${index}.timerMinutes`);
        setEditingTimerStepId(null);
    }

    return (
        <View style={styles.container}>
            <ProductCloud cloudRef={cloudRef} onLayout={onCloudLayout} />

            {fields.length > 0 && (
                <View>
                    {fields.map((field, index) => {
                        const watched = watchedSteps[index];
                        const watchedTimerMinutes: string =
                            watched?.timerMinutes ?? "";
                        const watchedTimerKind: TimerKind =
                            watched?.timerKind ?? "other";
                        const watchedIngredientIds: string[] =
                            watched?.ingredientIds ?? field.ingredientIds;

                        return (
                            <StepCard
                                key={field._key}
                                field={field}
                                index={index}
                                isLast={index === fields.length - 1}
                                canDelete={fields.length > 1}
                                isEditingTimer={editingTimerStepId === field.id}
                                watchedTimerMinutes={watchedTimerMinutes}
                                watchedTimerKind={watchedTimerKind}
                                watchedIngredientIds={watchedIngredientIds}
                                ingredientMap={ingredientMap}
                                timerMinRefMap={timerMinRefMap}
                                onActivate={() => setActiveStepId(field.id)}
                                onDelete={() => handleDelete(index)}
                                onOpenTimerEditor={() =>
                                    handleOpenTimerEditor(field.id)
                                }
                                onSaveTimer={() => handleSaveTimer(index)}
                                onRemoveTimer={() => handleRemoveTimer(index)}
                            />
                        );
                    })}
                </View>
            )}

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
    addSection: { gap: 8 },
    addButton: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderStyle: "dashed",
        alignItems: "center",
        justifyContent: "center",
    },
});
