// outsource dependencies
import type { Ref, ElementRef } from "react";
import type { TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { X, ChevronDown } from "lucide-react-native";
import { View, Pressable, StyleSheet } from "react-native";
import { useRef, useMemo, useState, useEffect } from "react";
import {
    Controller,
    useFormState,
    useFieldArray,
    useFormContext,
} from "react-hook-form";

// local dependencies
import { useTheme } from "../../theme";
import { tUnit } from "../../i18n/tUnit";
import { UNITS } from "../../domain/recipe";
import type { Unit } from "../../domain/recipe";
import type { RecipeFormValues } from "../../domain/recipeForm";
import {
    isFormErrorKey,
    emptyIngredient,
    unlinkIngredient,
} from "../../domain/recipeForm";
import {
    Text,
    Icon,
    Stepper,
    TextField,
    IconButton,
    OptionSheet,
} from "../../ui";

type TextInputRef = Ref<ElementRef<typeof TextInput>>;

export function IngredientsStep() {
    const { t } = useTranslation();
    const { colors } = useTheme();

    const { control, setValue, getValues, setFocus } =
        useFormContext<RecipeFormValues>();
    const { errors } = useFormState<RecipeFormValues>({ control });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "ingredients",
        keyName: "_key",
    });

    const [openSheetIndex, setOpenSheetIndex] = useState<number | null>(null);
    const pendingFocusIndex = useRef(-1);

    const unitOptions = useMemo(
        () =>
            UNITS.map((unit) => ({
                value: unit,
                label: tUnit(t, unit, 1),
            })),
        [t],
    );

    useEffect(() => {
        const idx = pendingFocusIndex.current;
        if (idx >= 0 && idx < fields.length) {
            setFocus(`ingredients.${idx}.name`);
            pendingFocusIndex.current = -1;
        }
    }, [fields.length, setFocus]);

    function handleAddIngredient() {
        pendingFocusIndex.current = fields.length;
        append(emptyIngredient());
    }

    function handleDelete(index: number) {
        const row = fields[index];
        if (row === undefined) return;
        const { id: ingredientId } = row;

        const steps = getValues("steps");
        steps.forEach((step, si) => {
            if (step.ingredientIds.includes(ingredientId)) {
                setValue(
                    `steps.${si}.ingredientIds`,
                    unlinkIngredient(step, ingredientId).ingredientIds,
                    { shouldDirty: true },
                );
            }
        });

        remove(index);
    }

    const currentSheetRow =
        openSheetIndex !== null ? fields[openSheetIndex] : undefined;
    const sheetUnit = currentSheetRow?.unit ?? "g";

    // toNestErrors puts path ["ingredients"] error in .root when item-level errors
    // coexist, or directly in .message when the array is empty and no item names exist.
    const rawListError =
        errors.ingredients?.root?.message ?? errors.ingredients?.message;
    const listError =
        rawListError !== undefined && isFormErrorKey(rawListError)
            ? t(rawListError)
            : undefined;

    return (
        <View style={styles.container}>
            {/* Header: "Ingredients for" + servings stepper */}
            <Controller
                name="servings"
                control={control}
                render={({ field }) => (
                    <View style={styles.headerRow}>
                        <Text variant="headline">
                            {t("recipeForm.ingredients.headerFor")}
                        </Text>
                        <Stepper
                            value={field.value}
                            onChange={field.onChange}
                            min={1}
                            max={50}
                            accessibilityLabel={t("recipe.servingsLabel")}
                            formatValue={(n) =>
                                t("recipe.servings", { count: n })
                            }
                        />
                    </View>
                )}
            />

            {/* Ingredient groups */}
            {fields.length > 0 && (
                <View>
                    {fields.map((field, index) => {
                        const rowErrors = errors.ingredients?.[index];
                        const rawNameError = rowErrors?.name?.message;
                        const rawAmountError = rowErrors?.amount?.message;
                        const translatedNameError =
                            rawNameError !== undefined &&
                            isFormErrorKey(rawNameError)
                                ? t(rawNameError)
                                : undefined;
                        const translatedAmountError =
                            rawAmountError !== undefined &&
                            isFormErrorKey(rawAmountError)
                                ? t(rawAmountError)
                                : undefined;
                        const displayError =
                            translatedNameError ?? translatedAmountError;
                        const isToTaste = field.unit === "toTaste";
                        const rowNum = index + 1;

                        return (
                            <View key={field._key} style={styles.group}>
                                {/* Line 1: name + delete */}
                                <View style={styles.nameLine}>
                                    <Controller
                                        name={`ingredients.${index}.name`}
                                        control={control}
                                        render={({ field: nameField }) => (
                                            <TextField
                                                ref={
                                                    nameField.ref as TextInputRef
                                                }
                                                value={nameField.value}
                                                onChangeText={
                                                    nameField.onChange
                                                }
                                                onBlur={nameField.onBlur}
                                                placeholder={t(
                                                    "recipeForm.ingredients.namePlaceholder",
                                                )}
                                                aria-label={t(
                                                    "recipeForm.ingredients.nameA11y",
                                                    { row: rowNum },
                                                )}
                                                style={styles.nameField}
                                                error={translatedNameError}
                                                hideErrorText
                                            />
                                        )}
                                    />
                                    <IconButton
                                        icon={X}
                                        variant="ghost"
                                        accessibilityLabel={t(
                                            "recipeForm.ingredients.deleteA11y",
                                            { row: rowNum },
                                        )}
                                        onPress={() => handleDelete(index)}
                                    />
                                </View>

                                {/* Line 2: amount + unit (or unit full-width if toTaste) */}
                                <View style={styles.amountLine}>
                                    {!isToTaste && (
                                        <Controller
                                            name={`ingredients.${index}.amount`}
                                            control={control}
                                            render={({
                                                field: amountField,
                                            }) => (
                                                <TextField
                                                    ref={
                                                        amountField.ref as TextInputRef
                                                    }
                                                    value={amountField.value}
                                                    onChangeText={
                                                        amountField.onChange
                                                    }
                                                    onBlur={amountField.onBlur}
                                                    keyboardType="decimal-pad"
                                                    placeholder={t(
                                                        "recipeForm.ingredients.amountPlaceholder",
                                                    )}
                                                    aria-label={t(
                                                        "recipeForm.ingredients.amountA11y",
                                                        { row: rowNum },
                                                    )}
                                                    style={styles.amountField}
                                                    error={
                                                        translatedAmountError
                                                    }
                                                    hideErrorText
                                                />
                                            )}
                                        />
                                    )}

                                    {/* Unit button */}
                                    <Controller
                                        name={`ingredients.${index}.unit`}
                                        control={control}
                                        render={({ field: unitField }) => {
                                            const unitLabel = tUnit(
                                                t,
                                                unitField.value,
                                                1,
                                            );
                                            return (
                                                <Pressable
                                                    role="button"
                                                    aria-label={t(
                                                        "recipeForm.ingredients.unitA11y",
                                                        {
                                                            row: rowNum,
                                                            unit: unitLabel,
                                                        },
                                                    )}
                                                    onPress={() =>
                                                        setOpenSheetIndex(index)
                                                    }
                                                    style={[
                                                        styles.unitButton,
                                                        isToTaste
                                                            ? styles.unitButtonFull
                                                            : styles.unitButtonFixed,
                                                        {
                                                            backgroundColor:
                                                                colors.surface,
                                                            borderColor:
                                                                colors.borderStrong,
                                                        },
                                                    ]}
                                                >
                                                    <Text
                                                        variant="label"
                                                        numberOfLines={1}
                                                        style={
                                                            styles.unitLabelText
                                                        }
                                                    >
                                                        {unitLabel}
                                                    </Text>
                                                    <Icon
                                                        icon={ChevronDown}
                                                        size={14}
                                                        tone="textMuted"
                                                    />
                                                </Pressable>
                                            );
                                        }}
                                    />
                                </View>

                                {/* Error line */}
                                {displayError !== undefined && (
                                    <Text
                                        variant="caption"
                                        tone="danger"
                                        style={styles.rowError}
                                    >
                                        {displayError}
                                    </Text>
                                )}

                                {/* Divider (not after last group) */}
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
                            </View>
                        );
                    })}
                </View>
            )}

            {/* Empty hint */}
            {fields.length === 0 && (
                <Text
                    variant="caption"
                    tone="textMuted"
                    style={styles.emptyHint}
                >
                    {t("recipeForm.ingredients.emptyHint")}
                </Text>
            )}

            {/* List-level error + add button */}
            <View style={styles.addSection}>
                {listError !== undefined && (
                    <Text variant="caption" tone="danger">
                        {listError}
                    </Text>
                )}
                <Pressable
                    role="button"
                    onPress={handleAddIngredient}
                    style={[styles.addButton, { borderColor: colors.primary }]}
                >
                    <Text variant="label" tone="primary">
                        {t("recipeForm.ingredients.addIngredient")}
                    </Text>
                </Pressable>
            </View>

            {/* Unit selection sheet */}
            <OptionSheet
                visible={openSheetIndex !== null}
                title={t("recipeForm.ingredients.unitSheetTitle")}
                options={unitOptions}
                selectedValue={sheetUnit}
                onSelect={(value) => {
                    if (openSheetIndex === null) return;
                    const unit = value as Unit;
                    setValue(`ingredients.${openSheetIndex}.unit`, unit, {
                        shouldDirty: true,
                    });
                    if (unit === "toTaste") {
                        setValue(`ingredients.${openSheetIndex}.amount`, "", {
                            shouldDirty: true,
                        });
                    }
                }}
                onClose={() => setOpenSheetIndex(null)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 16,
        marginTop: 24,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    group: {
        gap: 8,
    },
    nameLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    nameField: {
        flex: 1,
    },
    amountLine: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    amountField: {
        flex: 1,
    },
    unitButton: {
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        gap: 4,
    },
    unitButtonFixed: {
        width: 120,
    },
    unitButtonFull: {
        flex: 1,
    },
    unitLabelText: {
        flex: 1,
    },
    rowError: {
        marginTop: 2,
    },
    groupDivider: {
        height: StyleSheet.hairlineWidth,
        marginTop: 8,
        marginBottom: 8,
    },
    emptyHint: {
        textAlign: "center",
        paddingVertical: 8,
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
