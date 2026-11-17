// outsource dependencies
import { useTranslation } from "react-i18next";
import { useWatch, useFormContext } from "react-hook-form";
import { View, Pressable, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../../theme";
import { tUnit } from "../../i18n/tUnit";
import { formatQuantity } from "../../domain/scaling";
import { highlightSegments } from "../../domain/highlight";
import { formatDuration } from "../../i18n/formatDuration";
import type { RecipeFormValues } from "../../domain/recipeForm";
import { Text, Card, Banner, InfoChip, TimerBadge } from "../../ui";
import { parseDecimal, unusedIngredients } from "../../domain/recipeForm";

const BADGE_SIZE = 28;

type Props = {
    onGoToStep: (index: number) => void;
};

export function ReviewStep({ onGoToStep }: Props) {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const { control } = useFormContext<RecipeFormValues>();

    const title = useWatch({ control, name: "title" });
    const tags = useWatch({ control, name: "tags" });
    const steps = useWatch({ control, name: "steps" });
    const servings = useWatch({ control, name: "servings" });
    const ingredients = useWatch({ control, name: "ingredients" });
    const totalMinutes = useWatch({ control, name: "totalMinutes" });
    const caloriesPerServing = useWatch({
        control,
        name: "caloriesPerServing",
    });

    const parsedMinutes = parseDecimal(totalMinutes);
    const parsedKcal = parseDecimal(caloriesPerServing);

    const unused = unusedIngredients({
        title,
        servings,
        totalMinutes,
        caloriesPerServing,
        tags,
        ingredients,
        steps,
    });

    const metaParts: string[] = [];
    if (
        parsedMinutes !== undefined &&
        !Number.isNaN(parsedMinutes) &&
        parsedMinutes > 0
    ) {
        metaParts.push(formatDuration(t, parsedMinutes));
    }
    metaParts.push(t("recipe.servings", { count: servings }));
    if (
        parsedKcal !== undefined &&
        !Number.isNaN(parsedKcal) &&
        parsedKcal > 0
    ) {
        metaParts.push(t("recipe.calories", { count: parsedKcal }));
    }

    return (
        <View style={styles.container}>
            {/* Summary card */}
            <Card>
                <Text variant="headline">{title}</Text>
                <Text variant="caption" tone="textMuted">
                    {metaParts.join(" · ")}
                </Text>
                {tags.length > 0 && (
                    <View style={styles.tagRow}>
                        {tags.map((tag) => (
                            <InfoChip key={tag} label={t(`tags.${tag}`)} />
                        ))}
                    </View>
                )}
                <Pressable
                    role="button"
                    aria-label={t("recipeForm.review.editBasics")}
                    onPress={() => onGoToStep(0)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text variant="label" tone="primary">
                        {t("recipeForm.review.editBasics")}
                    </Text>
                </Pressable>
            </Card>

            {/* Unused ingredients info banner */}
            {unused.length > 0 && (
                <View style={styles.bannerWrapper}>
                    <Banner
                        tone="info"
                        message={t("recipeForm.review.unusedBanner", {
                            names: unused.map((i) => i.name).join(", "),
                        })}
                    />
                </View>
            )}

            {/* Ingredients section */}
            <View style={[styles.sectionRow, styles.sectionTopMargin]}>
                <Text variant="headline" role="heading">
                    {t("recipeForm.review.ingredientsHeader", {
                        count: servings,
                    })}
                </Text>
                <Pressable
                    role="button"
                    aria-label={t("recipeForm.review.editIngredients")}
                    onPress={() => onGoToStep(1)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text variant="label" tone="primary">
                        {t("recipeForm.review.edit")}
                    </Text>
                </Pressable>
            </View>

            {ingredients.map((ingredient, index) => {
                let amountText = "";
                if (ingredient.unit === "toTaste") {
                    amountText = t("units.toTaste");
                } else {
                    const amount = parseDecimal(ingredient.amount);
                    if (
                        amount !== undefined &&
                        !Number.isNaN(amount) &&
                        amount > 0
                    ) {
                        amountText = `${formatQuantity(amount, i18n.language)} ${tUnit(t, ingredient.unit, amount)}`;
                    }
                }
                return (
                    <View key={ingredient.id}>
                        <View style={styles.ingredientRow}>
                            <View style={styles.ingredientLeft}>
                                <View
                                    style={[
                                        styles.dot,
                                        { backgroundColor: colors.primary },
                                    ]}
                                />
                                <Text variant="body">{ingredient.name}</Text>
                            </View>
                            <Text
                                variant="body"
                                tone="textMuted"
                                style={styles.amountText}
                            >
                                {amountText}
                            </Text>
                        </View>
                        {index < ingredients.length - 1 && (
                            <View
                                style={[
                                    styles.thinDivider,
                                    { backgroundColor: colors.border },
                                ]}
                            />
                        )}
                    </View>
                );
            })}

            {/* Steps section */}
            <View style={[styles.sectionRow, styles.sectionTopMargin]}>
                <Text variant="headline" role="heading">
                    {t("recipe.stepsTitle")}
                </Text>
                <Pressable
                    role="button"
                    aria-label={t("recipeForm.review.editSteps")}
                    onPress={() => onGoToStep(2)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                    <Text variant="label" tone="primary">
                        {t("recipeForm.review.edit")}
                    </Text>
                </Pressable>
            </View>

            {steps.map((step, index) => {
                const terms = step.ingredientIds
                    .map(
                        (id) =>
                            ingredients.find((i) => i.id === id)?.name ?? "",
                    )
                    .filter((name) => name !== "");
                const segments = highlightSegments(step.text, terms);

                const parsedTimer = parseDecimal(step.timerMinutes);

                return (
                    <View key={step.id} style={styles.stepRow}>
                        <View
                            style={[
                                styles.stepBadge,
                                { backgroundColor: colors.primarySoft },
                            ]}
                        >
                            <Text variant="caption" tone="primary">
                                {String(index + 1)}
                            </Text>
                        </View>
                        <View style={styles.stepContent}>
                            <Text variant="body">
                                {segments.map((seg, si) =>
                                    seg.highlighted ? (
                                        <Text
                                            key={si}
                                            style={[
                                                styles.highlight,
                                                {
                                                    backgroundColor:
                                                        colors.primarySoft,
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
                            {parsedTimer !== undefined &&
                                !Number.isNaN(parsedTimer) &&
                                parsedTimer > 0 && (
                                    <TimerBadge
                                        kind={step.timerKind}
                                        timeLabel={formatDuration(
                                            t,
                                            parsedTimer,
                                        )}
                                        kindLabel={t(
                                            `timerKinds.${step.timerKind}`,
                                        )}
                                    />
                                )}
                        </View>
                    </View>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    bannerWrapper: {
        marginTop: 16,
    },
    sectionRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    sectionTopMargin: {
        marginTop: 20,
        marginBottom: 16,
    },
    ingredientRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
    },
    ingredientLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        flex: 1,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    amountText: {
        marginLeft: 8,
    },
    thinDivider: {
        height: StyleSheet.hairlineWidth,
        marginLeft: 16,
    },
    stepRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 20,
    },
    stepBadge: {
        width: BADGE_SIZE,
        height: BADGE_SIZE,
        borderRadius: BADGE_SIZE / 2,
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
    },
    stepContent: {
        flex: 1,
        gap: 8,
    },
    highlight: {
        fontWeight: "600",
    },
});
