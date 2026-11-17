// outsource dependencies
import type { ElementRef } from "react";
import type { View } from "react-native";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchX, ChevronRight } from "lucide-react-native";
import { useRef, useMemo, useState, useEffect } from "react";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import {
    ScrollView,
    StyleSheet,
    View as RNView,
    findNodeHandle,
} from "react-native";

// local dependencies
import { spacing, useTheme } from "../theme";
import { StepsStep } from "./recipeForm/StepsStep";
import { useStores } from "../stores/StoreProvider";
import { BasicsStep } from "./recipeForm/BasicsStep";
import { ReviewStep } from "./recipeForm/ReviewStep";
import { IngredientsStep } from "./recipeForm/IngredientsStep";
import type { RootStackScreenProps } from "../navigation/types";
import { Banner, Button, EmptyState, WizardProgress } from "../ui";
import type { WizardStep, RecipeFormValues } from "../domain/recipeForm";
import {
    fromRecipe,
    WIZARD_STEPS,
    emptyFormValues,
    recipeFormSchema,
    unusedIngredients,
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
    const [showUnusedWarning, setShowUnusedWarning] = useState(false);
    const scrollRef = useRef<ElementRef<typeof ScrollView>>(null);
    const cloudRef = useRef<ElementRef<typeof View>>(null);

    const currentStepKey: WizardStep = WIZARD_STEPS[currentIndex] ?? "basics";
    const isLastStep = currentIndex === WIZARD_STEPS.length - 1;

    const watchedIngredients = useWatch({
        control: form.control,
        name: "ingredients",
    });
    const watchedSteps = useWatch({ control: form.control, name: "steps" });

    const liveUnused = useMemo(() => {
        const usedIds = new Set(watchedSteps.flatMap((s) => s.ingredientIds));
        return watchedIngredients.filter(
            (i) => i.name.trim() !== "" && !usedIds.has(i.id),
        );
    }, [watchedIngredients, watchedSteps]);

    useEffect(() => {
        if (liveUnused.length === 0) {
            setShowUnusedWarning(false);
        }
    }, [liveUnused]);

    useEffect(() => {
        setShowUnusedWarning(false);
    }, [currentStepKey]);

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

    function scrollToCloud() {
        const cloud = cloudRef.current;
        const scroll = scrollRef.current;
        if (cloud === null || scroll === null) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        const scrollNode = findNodeHandle(scroll);
        if (scrollNode == null) {
            scroll.scrollTo({ y: 0, animated: true });
            return;
        }
        cloud.measureLayout(
            scrollNode,
            (_x, y) => scroll.scrollTo({ y, animated: true }),
            () => scroll.scrollTo({ y: 0, animated: true }),
        );
    }

    function handleAddToSteps() {
        setShowUnusedWarning(false);
        scrollToCloud();
    }

    function handleContinueAnyway() {
        setShowUnusedWarning(false);
        goToStep(currentIndex + 1);
    }

    async function handleNext() {
        const fields = WIZARD_STEP_FIELDS[currentStepKey];
        const isValid = await form.trigger([...fields], { shouldFocus: true });
        if (!isValid) return;

        if (currentStepKey === "steps") {
            const unused = unusedIngredients(form.getValues());
            if (unused.length > 0) {
                setShowUnusedWarning(true);
                return;
            }
        }

        goToStep(currentIndex + 1);
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
            <RNView
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
                    {currentStepKey === "steps" && (
                        <StepsStep cloudRef={cloudRef} />
                    )}
                    {currentStepKey === "review" && <ReviewStep />}
                    {showUnusedWarning && (
                        <Banner
                            tone="warning"
                            title={t("recipeForm.unusedWarning.title", {
                                count: liveUnused.length,
                            })}
                            message={liveUnused.map((i) => i.name).join(", ")}
                            actions={
                                <>
                                    <Button
                                        label={t(
                                            "recipeForm.unusedWarning.addToSteps",
                                        )}
                                        variant="secondary"
                                        onPress={handleAddToSteps}
                                    />
                                    <Button
                                        label={t(
                                            "recipeForm.unusedWarning.continueAnyway",
                                        )}
                                        variant="primary"
                                        onPress={handleContinueAnyway}
                                    />
                                </>
                            }
                        />
                    )}
                    <RNView style={styles.buttonRow}>
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
                    </RNView>
                </ScrollView>
            </RNView>
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
