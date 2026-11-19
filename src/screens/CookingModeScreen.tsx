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
import { useStores } from "../stores/StoreProvider";
import { Text, Button, EmptyState, IconButton } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";
import { useKeepAwakeWhileFocused } from "../hooks/useKeepAwakeWhileFocused";

const HORIZONTAL_PAD = 20;

type Props = RootStackScreenProps<"CookingMode">;

export const CookingModeScreen = observer(function CookingModeScreenComponent({
    navigation,
    route,
}: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { recipes } = useStores();
    const insets = useSafeAreaInsets();
    useKeepAwakeWhileFocused("cooking-mode");
    const { recipeId } = route.params;

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
    const isFirst = stepIndex === 0;
    const isLast = stepIndex === steps.length - 1;
    const currentStep = steps[stepIndex];
    if (currentStep === undefined) {
        return null;
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
                <Text variant="step">{currentStep.text}</Text>
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
    backButton: {
        flex: 1,
    },
    nextButton: {
        flex: 2,
    },
});
