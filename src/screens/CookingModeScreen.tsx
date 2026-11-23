// outsource dependencies
import type { ComponentRef } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useRef, useState, useEffect } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
    X,
    Check,
    SearchX,
    ChevronLeft,
    ChevronRight,
} from "lucide-react-native";

// local dependencies
import { useTheme } from "../theme";
import { useNow } from "../hooks/useNow";
import { useStores } from "../stores/StoreProvider";
import { scaleIngredients } from "../domain/scaling";
import { highlightSegments } from "../domain/highlight";
import type { RootStackScreenProps } from "../navigation/types";
import { formatIngredientAmount } from "../i18n/formatIngredientAmount";
import { useKeepAwakeWhileFocused } from "../hooks/useKeepAwakeWhileFocused";
import {
    isDone,
    isRunning,
    getRemainingMs,
    formatRemaining,
} from "../domain/timer";
import {
    Text,
    Button,
    EmptyState,
    IconButton,
    StepTimerCard,
    IngredientChip,
} from "../ui";

const HORIZONTAL_PAD = 20;

type Props = RootStackScreenProps<"CookingMode">;

export const CookingModeScreen = observer(function CookingModeScreenComponent({
    navigation,
    route,
}: Props) {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const { recipes, timers } = useStores();
    const insets = useSafeAreaInsets();
    useKeepAwakeWhileFocused("cooking-mode");
    const { recipeId, servings } = route.params;
    const now = useNow(timers.hasRunning);

    const recipe = recipes.byId.get(recipeId);
    const [stepIndex, setStepIndex] = useState(0);
    const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
    useEffect(() => {
        scrollRef.current?.scrollTo({ y: 0, animated: false });
    }, [stepIndex]);

    if (recipe === undefined) {
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

    const steps = recipe.steps;
    const scaledIngredients = scaleIngredients(
        recipe.ingredients,
        recipe.servings,
        servings,
    );

    const isFirst = stepIndex === 0;
    const isLast = stepIndex === steps.length - 1;
    const currentStep = steps[stepIndex];
    if (currentStep === undefined) {
        return null;
    }

    const terms = currentStep.ingredientIds
        .map(
            (id) => recipe.ingredients.find((ing) => ing.id === id)?.name ?? "",
        )
        .filter((name) => name !== "");
    const segments = highlightSegments(currentStep.text, terms);

    const stepIngredients = currentStep.ingredientIds.flatMap((id) => {
        const ing = scaledIngredients.find((i) => i.id === id);
        return ing !== undefined ? [ing] : [];
    });

    const stepTimer = currentStep.timer;
    const timer =
        stepTimer !== undefined ? timers.findByStep(currentStep.id) : undefined;
    let timerStatus: "idle" | "running" | "paused" | "done" = "idle";
    let timerTimeText =
        stepTimer !== undefined
            ? formatRemaining(stepTimer.minutes * 60_000)
            : "";
    if (timer !== undefined) {
        timerTimeText = formatRemaining(getRemainingMs(timer, now));
        if (isDone(timer, now)) {
            timerStatus = "done";
        } else if (isRunning(timer)) {
            timerStatus = "running";
        } else {
            timerStatus = "paused";
        }
    }

    const goBack = () => setStepIndex((i) => Math.max(0, i - 1));
    const goNext = () => {
        if (isLast) {
            navigation.goBack();
        } else {
            setStepIndex((i) => Math.min(steps.length - 1, i + 1));
        }
    };

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                <IconButton
                    icon={X}
                    size="lg"
                    variant="subtle"
                    accessibilityLabel={t("cookingMode.close")}
                    onPress={() => navigation.goBack()}
                />
                <View style={styles.progressInfo}>
                    <Text variant="label">
                        {t("cookingMode.progress", {
                            current: stepIndex + 1,
                            total: steps.length,
                        })}
                    </Text>
                    <View style={styles.progressBar} aria-hidden={true}>
                        {steps.map((step, index) => (
                            <View
                                key={step.id}
                                style={[
                                    styles.progressSegment,
                                    {
                                        backgroundColor:
                                            index <= stepIndex
                                                ? colors.primary
                                                : colors.border,
                                    },
                                ]}
                            />
                        ))}
                    </View>
                </View>
            </View>

            <ScrollView
                ref={scrollRef}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
            >
                <Text variant="step">
                    {segments.map((seg, si) =>
                        seg.highlighted ? (
                            <Text
                                key={si}
                                variant="step"
                                style={[
                                    styles.highlight,
                                    {
                                        backgroundColor: colors.primarySoft,
                                    },
                                ]}
                            >
                                {seg.text}
                            </Text>
                        ) : (
                            seg.text
                        ),
                    )}
                </Text>
                {stepIngredients.length > 0 && (
                    <View style={styles.chipRow}>
                        {stepIngredients.map((ing) => (
                            <IngredientChip
                                key={ing.id}
                                amount={formatIngredientAmount(
                                    t,
                                    i18n.language,
                                    ing,
                                )}
                                name={ing.name}
                            />
                        ))}
                    </View>
                )}
                {stepTimer !== undefined && (
                    <View style={styles.timerCardWrapper}>
                        <StepTimerCard
                            kind={stepTimer.kind}
                            kindLabel={t(`timerKinds.${stepTimer.kind}`)}
                            timeText={timerTimeText}
                            status={timerStatus}
                            onStart={() =>
                                timers.start({
                                    step: {
                                        recipeId,
                                        stepId: currentStep.id,
                                    },
                                    kind: stepTimer.kind,
                                    minutes: stepTimer.minutes,
                                })
                            }
                            onPause={() => {
                                if (timer !== undefined) timers.pause(timer.id);
                            }}
                            onResume={() => {
                                if (timer !== undefined)
                                    timers.resume(timer.id);
                            }}
                            onRestart={() => {
                                if (timer !== undefined)
                                    timers.restart(timer.id);
                            }}
                            onStop={() => {
                                if (timer !== undefined)
                                    timers.remove(timer.id);
                            }}
                            onAdjust={(delta) => {
                                if (timer !== undefined)
                                    timers.adjust(timer.id, delta);
                            }}
                        />
                    </View>
                )}
            </ScrollView>

            <View
                style={[
                    styles.bottomBar,
                    { paddingBottom: insets.bottom + 28 },
                ]}
            >
                <Button
                    label={t("cookingMode.back")}
                    variant="secondary"
                    size="xl"
                    icon={ChevronLeft}
                    iconPosition="start"
                    disabled={isFirst}
                    onPress={goBack}
                    style={styles.backButton}
                />
                <Button
                    label={
                        isLast ? t("cookingMode.done") : t("cookingMode.next")
                    }
                    variant="primary"
                    size="xl"
                    icon={isLast ? Check : ChevronRight}
                    iconPosition="end"
                    onPress={goNext}
                    style={styles.nextButton}
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        flexDirection: "row",
        gap: 12,
        alignItems: "center",
        paddingHorizontal: HORIZONTAL_PAD,
    },
    progressInfo: {
        flex: 1,
        gap: 8,
    },
    progressBar: {
        flexDirection: "row",
        gap: 4,
    },
    progressSegment: {
        flex: 1,
        height: 6,
        borderRadius: 3,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 24,
        paddingBottom: 24,
        paddingHorizontal: HORIZONTAL_PAD,
    },
    bottomBar: {
        flexDirection: "row",
        gap: 12,
        paddingTop: 16,
        paddingHorizontal: HORIZONTAL_PAD,
    },
    highlight: {
        fontWeight: "800",
    },
    chipRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 16,
    },
    timerCardWrapper: {
        marginTop: 20,
    },
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 2,
    },
});
