// outsource dependencies
import type { ElementRef } from "react";
import type { View } from "react-native";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { zodResolver } from "@hookform/resolvers/zod";
import { SearchX, ChevronRight } from "lucide-react-native";
import { useForm, useWatch, FormProvider } from "react-hook-form";
import { ScrollView, StyleSheet, View as RNView } from "react-native";
import { useRef, useMemo, useState, useEffect, useCallback } from "react";

// local dependencies
import { spacing, useTheme } from "../theme";
import { StepsStep } from "./recipeForm/StepsStep";
import { useStores } from "../stores/StoreProvider";
import { BasicsStep } from "./recipeForm/BasicsStep";
import { ReviewStep } from "./recipeForm/ReviewStep";
import { ProductCloud } from "./recipeForm/ProductCloud";
import { IngredientsStep } from "./recipeForm/IngredientsStep";
import type { RootStackScreenProps } from "../navigation/types";
import { StepsEditorContext } from "./recipeForm/StepsEditorContext";
import type { InsertTrigger } from "./recipeForm/StepsEditorContext";
import { Banner, Button, TopSheet, EmptyState, WizardProgress } from "../ui";
import type {
    WizardStep,
    RecipeFormValues,
    RecipeFormIngredient,
} from "../domain/recipeForm";
import {
    toRecipe,
    fromRecipe,
    WIZARD_STEPS,
    emptyFormValues,
    recipeFormSchema,
    insertIngredient,
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
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [showUnusedWarning, setShowUnusedWarning] = useState(false);
    const [pendingFocusStep, setPendingFocusStep] = useState<WizardStep | null>(
        null,
    );
    const scrollRef = useRef<ElementRef<typeof ScrollView>>(null);
    const cloudRef = useRef<ElementRef<typeof View>>(null);

    // Steps editor shared state — provided to StepsEditorContext
    const [activeStepId, setActiveStepId] = useState<string | undefined>(
        () => defaultValues.steps[0]?.id,
    );
    const [insertTrigger, setInsertTrigger] = useState<InsertTrigger | null>(
        null,
    );
    const selectionMapRef = useRef<Map<string, { start: number; end: number }>>(
        new Map(),
    );
    const insertVersionRef = useRef(0);

    // Cloud visibility tracking — avoids re-renders during scroll
    const scrollYRef = useRef(0);
    const cloudBottomYRef = useRef<number | null>(null);
    const [showTopSheet, setShowTopSheet] = useState(false);
    const showTopSheetRef = useRef(false);
    const [topSheetOpen, setTopSheetOpen] = useState(false);

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

    const activeStepIndex = watchedSteps.findIndex(
        (s) => s.id === activeStepId,
    );
    const activeStepNum = activeStepIndex >= 0 ? activeStepIndex + 1 : 1;

    useEffect(() => {
        if (liveUnused.length === 0) {
            setShowUnusedWarning(false);
        }
    }, [liveUnused]);

    useEffect(() => {
        setShowUnusedWarning(false);
        setSaveError(false);
    }, [currentStepKey]);

    useEffect(() => {
        if (pendingFocusStep === null || currentStepKey !== pendingFocusStep)
            return;
        const fields = WIZARD_STEP_FIELDS[pendingFocusStep];
        setPendingFocusStep(null);
        form.trigger([...fields], { shouldFocus: true }).catch(() => {});
    }, [currentStepKey, pendingFocusStep, form]);

    // Close the floating panel when it goes back off-screen (cloud visible again)
    useEffect(() => {
        if (!showTopSheet) {
            setTopSheetOpen(false);
        }
    }, [showTopSheet]);

    const handleInsertIngredient = useCallback(
        (ingredient: RecipeFormIngredient) => {
            const steps = form.getValues("steps");
            const stepIdx = steps.findIndex((s) => s.id === activeStepId);
            if (stepIdx < 0) return;
            const currentStep = steps[stepIdx];
            if (currentStep === undefined) return;
            const sel = selectionMapRef.current.get(currentStep.id) ?? {
                start: currentStep.text.length,
                end: currentStep.text.length,
            };
            const { step: updatedStep, cursor } = insertIngredient(
                currentStep,
                ingredient,
                sel,
            );
            const hasTextError = form.getFieldState(
                `steps.${stepIdx}.text`,
            ).invalid;
            form.setValue(`steps.${stepIdx}.text`, updatedStep.text, {
                shouldDirty: true,
                shouldValidate: hasTextError,
            });
            form.setValue(
                `steps.${stepIdx}.ingredientIds`,
                updatedStep.ingredientIds,
                { shouldDirty: true },
            );
            insertVersionRef.current += 1;
            setInsertTrigger({
                stepId: currentStep.id,
                cursor,
                version: insertVersionRef.current,
            });
        },
        [activeStepId, form],
    );

    const stepsEditorContextValue = useMemo(
        () => ({
            activeStepId,
            activeStepNum,
            setActiveStepId,
            insertTrigger,
            selectionMapRef,
            onInsertIngredient: handleInsertIngredient,
        }),
        [activeStepId, activeStepNum, insertTrigger, handleInsertIngredient],
    );

    const wizardSteps = WIZARD_STEPS.map((key) => ({
        key,
        label: t(`recipeForm.steps.${key}`),
    }));

    const counterLabel = t("recipeForm.counter", {
        current: currentIndex + 1,
        total: WIZARD_STEPS.length,
    });

    function updateTopSheetVisibility(isOut: boolean) {
        if (isOut !== showTopSheetRef.current) {
            showTopSheetRef.current = isOut;
            setShowTopSheet(isOut);
        }
    }

    function goToStep(index: number) {
        setCurrentIndex(index);
        setHighestVisited((prev) => Math.max(prev, index));
        scrollRef.current?.scrollTo({ y: 0, animated: false });
        scrollYRef.current = 0;
        cloudBottomYRef.current = null;
        updateTopSheetVisibility(false);
    }

    function handleBack() {
        goToStep(currentIndex - 1);
    }

    function handleScroll(e: {
        nativeEvent: { contentOffset: { y: number } };
    }) {
        scrollYRef.current = e.nativeEvent.contentOffset.y;
        if (currentStepKey === "steps") {
            const isOut =
                cloudBottomYRef.current !== null &&
                cloudBottomYRef.current < scrollYRef.current;
            updateTopSheetVisibility(isOut);
        }
    }

    function handleCloudLayout() {
        const cloud = cloudRef.current;
        const scroll = scrollRef.current;
        if (cloud === null || scroll === null) return;
        const innerView = scroll.getInnerViewRef();
        if (innerView == null) return;
        cloud.measureLayout(
            innerView,
            (_x, y, _w, height) => {
                cloudBottomYRef.current = y + height;
                if (currentStepKey === "steps") {
                    updateTopSheetVisibility(
                        cloudBottomYRef.current < scrollYRef.current,
                    );
                }
            },
            () => {},
        );
    }

    function scrollToCloud() {
        const cloud = cloudRef.current;
        const scroll = scrollRef.current;
        if (cloud === null || scroll === null) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
            return;
        }
        const innerView = scroll.getInnerViewRef();
        if (innerView == null) {
            scroll.scrollTo({ y: 0, animated: true });
            return;
        }
        cloud.measureLayout(
            innerView,
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

    async function handleSave() {
        setSaving(true);
        setSaveError(false);

        const isValid = await form.trigger();

        if (!isValid) {
            setSaving(false);
            const errors = form.formState.errors;
            for (const [index, stepKey] of WIZARD_STEPS.entries()) {
                if (stepKey === "review") continue;
                const fields = WIZARD_STEP_FIELDS[stepKey];
                const hasError = fields.some(
                    (field) => errors[field] !== undefined,
                );
                if (hasError) {
                    goToStep(index);
                    setPendingFocusStep(WIZARD_STEPS[index] ?? null);
                    break;
                }
            }
            return;
        }

        try {
            const savedRecipe = toRecipe(form.getValues(), {
                existing: recipe,
            });
            if (isEditMode) {
                recipes.update(savedRecipe);
                navigation.goBack();
            } else {
                recipes.add(savedRecipe);
                navigation.replace("Recipe", { recipeId: savedRecipe.id });
            }
        } catch {
            setSaveError(true);
            setSaving(false);
        }
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

    const topSheetBarLabel = t("recipeForm.productCloud.barLabel", {
        n: activeStepNum,
    });

    return (
        <StepsEditorContext.Provider value={stepsEditorContextValue}>
            <FormProvider {...form}>
                <RNView
                    style={[
                        styles.container,
                        { backgroundColor: colors.background },
                    ]}
                >
                    <ScrollView
                        ref={scrollRef}
                        onScroll={handleScroll}
                        scrollEventThrottle={16}
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
                        {currentStepKey === "ingredients" && (
                            <IngredientsStep />
                        )}
                        {currentStepKey === "steps" && (
                            <StepsStep
                                cloudRef={cloudRef}
                                onCloudLayout={handleCloudLayout}
                            />
                        )}
                        {currentStepKey === "review" && (
                            <ReviewStep onGoToStep={goToStep} />
                        )}
                        {showUnusedWarning && (
                            <RNView style={styles.bannerWrapper}>
                                <Banner
                                    tone="warning"
                                    title={t("recipeForm.unusedWarning.title", {
                                        count: liveUnused.length,
                                    })}
                                    message={liveUnused
                                        .map((i) => i.name)
                                        .join(", ")}
                                    actions={
                                        <>
                                            <Button
                                                label={t(
                                                    "recipeForm.unusedWarning.addToSteps",
                                                )}
                                                variant="secondary"
                                                size="md"
                                                onPress={handleAddToSteps}
                                            />
                                            <Button
                                                label={t(
                                                    "recipeForm.unusedWarning.continueAnyway",
                                                )}
                                                variant="primary"
                                                size="md"
                                                onPress={handleContinueAnyway}
                                            />
                                        </>
                                    }
                                />
                            </RNView>
                        )}
                        {saveError && (
                            <RNView style={styles.bannerWrapper}>
                                <Banner
                                    tone="warning"
                                    message={t("recipeForm.review.saveError")}
                                />
                            </RNView>
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
                                    disabled={saving}
                                    onPress={handleSave}
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
                    {currentStepKey === "steps" && showTopSheet && (
                        <TopSheet
                            open={topSheetOpen}
                            onOpenChange={setTopSheetOpen}
                            barLabel={topSheetBarLabel}
                        >
                            <ProductCloud />
                        </TopSheet>
                    )}
                </RNView>
            </FormProvider>
        </StepsEditorContext.Provider>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        padding: spacing[16],
    },
    bannerWrapper: {
        marginTop: spacing[16],
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        marginTop: 32,
    },
    backButton: { flex: 1 },
    nextButton: { flex: 2 },
});
