// outsource dependencies
import type { ElementRef } from "react";
import { useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import type { FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { SearchX, ChevronRight } from "lucide-react-native";
import { View, ScrollView, StyleSheet } from "react-native";

// local dependencies
import { spacing, useTheme } from "../theme";
import { StepsStep } from "./recipeForm/StepsStep";
import { useStores } from "../stores/StoreProvider";
import { BasicsStep } from "./recipeForm/BasicsStep";
import { ReviewStep } from "./recipeForm/ReviewStep";
import { Button, EmptyState, WizardProgress } from "../ui";
import { IngredientsStep } from "./recipeForm/IngredientsStep";
import type { RootStackScreenProps } from "../navigation/types";
import type { WizardStep, RecipeFormValues } from "../domain/recipeForm";
import {
    fromRecipe,
    WIZARD_STEPS,
    emptyFormValues,
    recipeFormSchema,
    WIZARD_STEP_FIELDS,
} from "../domain/recipeForm";

type Props = RootStackScreenProps<"RecipeForm">;

export const RecipeFormScreen = observer(function RecipeFormScreenComponent({
    route,
    navigation,
}: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { recipes } = useStores();
    const { recipeId } = route.params;

    const isEditMode = recipeId !== undefined;
    const recipe = isEditMode ? recipes.byId.get(recipeId) : undefined;

    // Lazy initializer runs once on mount — form defaults don't update with the store
    const [defaultValues] = useState<RecipeFormValues>(() =>
        recipe !== undefined ? fromRecipe(recipe) : emptyFormValues(),
    );

    const form = useForm<RecipeFormValues>({
        resolver: zodResolver(recipeFormSchema),
        defaultValues,
        mode: "onTouched",
    });

    const [currentIndex, setCurrentIndex] = useState(0);
    const [highestVisited, setHighestVisited] = useState(0);
    const scrollRef = useRef<ElementRef<typeof ScrollView>>(null);

    const currentStepKey: WizardStep = WIZARD_STEPS[currentIndex] ?? "basics";
    const isLastStep = currentIndex === WIZARD_STEPS.length - 1;

    const wizardSteps = WIZARD_STEPS.map((key) => ({
        key,
        label: t(`recipeForm.steps.${key}`),
    }));

    const counterLabel = t("recipeForm.counter", {
        current: currentIndex + 1,
        total: WIZARD_STEPS.length,
    });

    function goToStep(index: number) {
        setCurrentIndex(index);
        setHighestVisited((prev) => Math.max(prev, index));
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }

    function handleBack() {
        goToStep(currentIndex - 1);
    }

    async function handleNext() {
        const fields = WIZARD_STEP_FIELDS[currentStepKey];
        const isValid = await form.trigger(
            fields as unknown as FieldPath<RecipeFormValues>[],
        );
        if (isValid) {
            goToStep(currentIndex + 1);
        } else {
            const errors = form.formState.errors;
            for (const field of fields) {
                if (errors[field] !== undefined) {
                    form.setFocus(field as FieldPath<RecipeFormValues>);
                    break;
                }
            }
        }
    }

    if (isEditMode && recipe === undefined) {
        return (
            <EmptyState
                icon={SearchX}
                title={t("recipe.notFound.title")}
                description={t("recipe.notFound.description")}
                actionLabel={t("recipe.notFound.action")}
                onAction={() => navigation.goBack()}
            />
        );
    }

    return (
        <FormProvider {...form}>
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                <ScrollView
                    ref={scrollRef}
                    keyboardShouldPersistTaps="handled"
                    automaticallyAdjustKeyboardInsets
                    contentContainerStyle={styles.scrollContent}
                >
                    <WizardProgress
                        steps={wizardSteps}
                        currentIndex={currentIndex}
                        counterLabel={counterLabel}
                        isStepPressable={(index) =>
                            isEditMode || index <= highestVisited
                        }
                        onStepPress={goToStep}
                    />
                    {currentStepKey === "basics" && <BasicsStep />}
                    {currentStepKey === "ingredients" && <IngredientsStep />}
                    {currentStepKey === "steps" && <StepsStep />}
                    {currentStepKey === "review" && <ReviewStep />}
                    <View style={styles.buttonRow}>
                        {currentIndex > 0 && (
                            <Button
                                label={t("recipeForm.buttons.back")}
                                variant="secondary"
                                onPress={handleBack}
                                style={styles.backButton}
                            />
                        )}
                        {isLastStep ? (
                            <Button
                                label={t("recipeForm.buttons.save")}
                                variant="primary"
                                disabled
                                onPress={() => {}}
                                style={styles.nextButton}
                            />
                        ) : (
                            <Button
                                label={t("recipeForm.buttons.next")}
                                variant="primary"
                                icon={ChevronRight}
                                iconPosition="end"
                                onPress={() => handleNext()}
                                style={styles.nextButton}
                            />
                        )}
                    </View>
                </ScrollView>
            </View>
        </FormProvider>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        padding: spacing[16],
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 32,
    },
    backButton: { flex: 1 },
    nextButton: { flex: 2 },
});
