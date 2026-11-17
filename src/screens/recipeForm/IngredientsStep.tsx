// outsource dependencies
import type { Ref, ElementRef } from "react";
import type { TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { X, ChevronDown } from "lucide-react-native";
import { View, Pressable, StyleSheet } from "react-native";
import { useRef, useMemo, useState, useEffect } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";

// local dependencies
import { useTheme } from "../../theme";
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

    const {
        control,
        setValue,
        getValues,
        setFocus,
        formState: { errors },
    } = useFormContext<RecipeFormValues>();

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
                label:
                    unit === "toTaste"
                        ? t("units.toTaste")
                        : t(`units.${unit}` as "units.g", { count: 1 }),
            })),
        [t],
    );

    useEffect(() => {
        const idx = pendingFocusIndex.current;
        if (idx >= 0 && idx < fields.length) {
            setFocus(`ingredients.${idx}.amount`);
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

            {/* Column captions */}
            {fields.length > 0 && (
                <View style={styles.captions}>
                    <Text
                        variant="caption"
                        tone="textMuted"
                        style={styles.captionQty}
                    >
                        {t("recipeForm.ingredients.colQty")}
                    </Text>
                    <Text
                        variant="caption"
                        tone="textMuted"
                        style={styles.captionUnit}
                    >
                        {t("recipeForm.ingredients.colUnit")}
                    </Text>
                    <Text
                        variant="caption"
                        tone="textMuted"
                        style={styles.captionName}
                    >
                        {t("recipeForm.ingredients.colName")}
                    </Text>
                </View>
            )}

            {/* Ingredient rows */}
            {fields.map((field, index) => {
                const rowErrors = errors.ingredients?.[index];
                const rawNameError = rowErrors?.name?.message;
                const rawAmountError = rowErrors?.amount?.message;
                const translatedNameError =
                    rawNameError !== undefined && isFormErrorKey(rawNameError)
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
                    <View key={field._key}>
                        <View style={styles.row}>
                            {/* Amount or spacer */}
                            {isToTaste ? (
                                <View style={styles.amountSpacer} />
                            ) : (
                                <Controller
                                    name={`ingredients.${index}.amount`}
                                    control={control}
                                    render={({ field: amountField }) => (
                                        <TextField
                                            ref={
                                                amountField.ref as TextInputRef
                                            }
                                            value={amountField.value}
                                            onChangeText={amountField.onChange}
                                            onBlur={amountField.onBlur}
                                            keyboardType="decimal-pad"
                                            textAlign="center"
                                            aria-label={t(
                                                "recipeForm.ingredients.amountA11y",
                                                { row: rowNum },
                                            )}
                                            style={styles.amountField}
                                            error={translatedAmountError}
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
                                    const unitLabel =
                                        unitField.value === "toTaste"
                                            ? t("units.toTaste")
                                            : t(
                                                  `units.${unitField.value}` as "units.g",
                                                  { count: 1 },
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
                                                style={styles.unitLabel}
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

                            {/* Name */}
                            <Controller
                                name={`ingredients.${index}.name`}
                                control={control}
                                render={({ field: nameField }) => (
                                    <TextField
                                        ref={nameField.ref as TextInputRef}
                                        value={nameField.value}
                                        onChangeText={nameField.onChange}
                                        onBlur={nameField.onBlur}
                                        placeholder={t(
                                            "recipeForm.ingredients.colName",
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

                            {/* Delete */}
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

                        {displayError !== undefined && (
                            <Text
                                variant="caption"
                                tone="danger"
                                style={styles.rowError}
                            >
                                {displayError}
                            </Text>
                        )}
                    </View>
                );
            })}

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

            {/* Add ingredient */}
            <Pressable
                role="button"
                onPress={handleAddIngredient}
                style={[
                    styles.addButton,
                    {
                        borderColor: colors.primary,
                    },
                ]}
            >
                <Text variant="label" tone="primary">
                    {t("recipeForm.ingredients.addIngredient")}
                </Text>
            </Pressable>

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
    captions: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingRight: 50,
    },
    captionQty: {
        width: 64,
        textAlign: "center",
    },
    captionUnit: {
        width: 78,
    },
    captionName: {
        flex: 1,
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    amountField: {
        width: 64,
    },
    amountSpacer: {
        width: 64,
    },
    unitButton: {
        width: 78,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        paddingHorizontal: 6,
    },
    unitLabel: {
        flex: 1,
        textAlign: "center",
    },
    nameField: {
        flex: 1,
    },
    rowError: {
        marginTop: 2,
        marginLeft: 6,
    },
    emptyHint: {
        textAlign: "center",
        paddingVertical: 8,
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
