// outsource dependencies
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { View, ScrollView, StyleSheet } from "react-native";

// local dependencies
import { TimerPill } from "../../ui";
import type { TimerState } from "../../domain/timer";
import { useStores } from "../../stores/StoreProvider";
import { isDone, getRemainingMs, formatRemaining } from "../../domain/timer";

const AUTO_COLLAPSE_MS = 4000;

type Props = {
    recipeId: string;
    currentStepId: string;
    now: number;
    onOpenStep: (stepId: string) => void;
    onOpenTarget: (timerId: string) => void;
};

export const TimerPillsRow = observer(function TimerPillsRowComponent({
    recipeId,
    currentStepId,
    now,
    onOpenStep,
    onOpenTarget,
}: Props) {
    const { t } = useTranslation();
    const { recipes, timers } = useStores();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const pills = timers.list.filter(
        (timer) => timer.step?.stepId !== currentStepId,
    );
    const expandedPresent =
        expandedId !== null && pills.some((p) => p.id === expandedId);

    useEffect(() => {
        if (expandedId !== null && !expandedPresent) {
            setExpandedId(null);
        }
    }, [expandedId, expandedPresent]);

    useEffect(() => {
        if (expandedId === null) return;
        const timeout = setTimeout(() => setExpandedId(null), AUTO_COLLAPSE_MS);
        return () => clearTimeout(timeout);
    }, [expandedId]);

    if (pills.length === 0) return null;

    const buildLabel = (timer: TimerState): string => {
        const kindLabel = t(`timerKinds.${timer.kind}`);
        const fallback = timer.label ?? kindLabel;
        const step = timer.step;
        if (step === undefined) return fallback;
        const timerRecipe = recipes.byId.get(step.recipeId);
        if (timerRecipe === undefined) return fallback;
        const idx = timerRecipe.steps.findIndex((s) => s.id === step.stepId);
        if (idx < 0) return fallback;
        const n = idx + 1;
        if (timerRecipe.id === recipeId) {
            return t("timers.pill.step", { n });
        }
        return t("timers.pill.recipeStep", { recipe: timerRecipe.title, n });
    };

    const handlePress = (timer: TimerState) => {
        if (expandedId !== timer.id) {
            setExpandedId(timer.id);
            return;
        }
        setExpandedId(null);
        const step = timer.step;
        if (step !== undefined && step.recipeId === recipeId) {
            const timerRecipe = recipes.byId.get(step.recipeId);
            if (
                timerRecipe !== undefined &&
                timerRecipe.steps.some((s) => s.id === step.stepId)
            ) {
                onOpenStep(step.stepId);
                return;
            }
        }
        onOpenTarget(timer.id);
    };

    return (
        <View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.row}
            >
                {pills.map((timer) => (
                    <TimerPill
                        key={timer.id}
                        kind={timer.kind}
                        kindLabel={t(`timerKinds.${timer.kind}`)}
                        timeText={formatRemaining(getRemainingMs(timer, now))}
                        finished={isDone(timer, now)}
                        expanded={expandedId === timer.id}
                        label={buildLabel(timer)}
                        onPress={() => handlePress(timer)}
                    />
                ))}
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    row: {
        gap: 8,
    },
});
