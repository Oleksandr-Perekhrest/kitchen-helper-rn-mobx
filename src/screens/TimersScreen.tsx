// outsource dependencies
import { observer } from "mobx-react-lite";
import { Timer } from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { View, ScrollView, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// local dependencies
import { useTheme } from "../theme";
import { useNow } from "../hooks/useNow";
import type { TimerState } from "../domain/timer";
import { useStores } from "../stores/StoreProvider";
import { Text, TimerCard, EmptyState } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";
import { resolveOpenTarget } from "../notifications/openTarget";
import {
    isDone,
    isRunning,
    getRemainingMs,
    formatRemaining,
    orderTimersForDisplay,
} from "../domain/timer";

type Props = RootStackScreenProps<"Timers">;

const HORIZONTAL_PAD = 20;

export const TimersScreen = observer(function TimersScreenComponent({
    navigation,
}: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { recipes, timers } = useStores();
    const insets = useSafeAreaInsets();
    const now = useNow(timers.hasRunning);

    const ordered = orderTimersForDisplay(timers.list, now);
    const activeCount = ordered.reduce(
        (count, timer) => (isDone(timer, now) ? count : count + 1),
        0,
    );

    if (ordered.length === 0) {
        return (
            <View
                style={[
                    styles.container,
                    { backgroundColor: colors.background },
                ]}
            >
                <EmptyState
                    icon={Timer}
                    title={t("timers.empty.title")}
                    description={t("timers.empty.description")}
                />
            </View>
        );
    }

    const statusOf = (timer: TimerState): "running" | "paused" | "done" => {
        if (isDone(timer, now)) return "done";
        if (isRunning(timer)) return "running";
        return "paused";
    };

    const subtitleOf = (timer: TimerState): string => {
        const step = timer.step;
        if (step === undefined) return t("timers.card.custom");
        const recipe = recipes.byId.get(step.recipeId);
        if (recipe === undefined) return t("timers.card.custom");
        const idx = recipe.steps.findIndex((s) => s.id === step.stepId);
        if (idx < 0) return t("timers.card.custom");
        return t("timers.pill.recipeStep", {
            recipe: recipe.title,
            n: idx + 1,
        });
    };

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.content,
                    { paddingBottom: insets.bottom + 24 },
                ]}
            >
                {activeCount > 0 && (
                    <Text
                        variant="caption"
                        tone="textMuted"
                        style={styles.activeCount}
                    >
                        {t("timers.activeCount", { count: activeCount })}
                    </Text>
                )}
                {ordered.map((timer) => {
                    const kindLabel = t(`timerKinds.${timer.kind}`);
                    const target = resolveOpenTarget(timer.id, timers, recipes);
                    const onOpen =
                        target.screen === "CookingMode"
                            ? () => {
                                  navigation.navigate("CookingMode", {
                                      recipeId: target.recipeId,
                                      servings: target.servings,
                                      stepId: target.stepId,
                                      openedAt: Date.now(),
                                  });
                              }
                            : undefined;
                    return (
                        <TimerCard
                            key={timer.id}
                            kind={timer.kind}
                            kindLabel={kindLabel}
                            title={timer.label ?? kindLabel}
                            subtitle={subtitleOf(timer)}
                            timeText={formatRemaining(
                                getRemainingMs(timer, now),
                            )}
                            status={statusOf(timer)}
                            onPause={() => timers.pause(timer.id)}
                            onResume={() => timers.resume(timer.id)}
                            onRestart={() => timers.restart(timer.id)}
                            onAdjust={(delta) => timers.adjust(timer.id, delta)}
                            onDelete={() => timers.remove(timer.id)}
                            onOpen={onOpen}
                        />
                    );
                })}
            </ScrollView>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: {
        paddingHorizontal: HORIZONTAL_PAD,
        paddingTop: 16,
        gap: 12,
    },
    activeCount: {
        marginBottom: 4,
    },
});
