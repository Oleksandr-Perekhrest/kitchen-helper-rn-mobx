// outsource dependencies
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useState, useLayoutEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, Image, Pressable, ScrollView, StyleSheet } from "react-native";
import {
    Star,
    Play,
    Clock,
    Pencil,
    SearchX,
    UtensilsCrossed,
} from "lucide-react-native";

// local dependencies
import { useTheme } from "../theme";
import { useStores } from "../stores/StoreProvider";
import { formatDuration } from "../i18n/formatDuration";
import { highlightSegments } from "../domain/highlight";
import type { RootStackScreenProps } from "../navigation/types";
import { formatQuantity, scaleIngredients } from "../domain/scaling";
import {
    Text,
    Icon,
    Button,
    Stepper,
    EmptyState,
    IconButton,
    TimerBadge,
} from "../ui";

const HORIZONTAL_PAD = 16;
const PHOTO_HEIGHT = 220;
const BADGE_SIZE = 28;

type Props = RootStackScreenProps<"Recipe">;

export const RecipeScreen = observer(function RecipeScreenComponent({
    navigation,
    route,
}: Props) {
    const { t, i18n } = useTranslation();
    const { colors } = useTheme();
    const { recipes } = useStores();
    const insets = useSafeAreaInsets();
    const { recipeId } = route.params;

    const recipe = recipes.byId.get(recipeId);

    const [servings, setServings] = useState(() => recipe?.servings ?? 1);

    useLayoutEffect(() => {
        if (recipe === undefined) return;
        navigation.setOptions({
            headerRight: () => (
                <View style={styles.headerButtons}>
                    <Pressable
                        role="button"
                        aria-label={
                            recipe.favorite
                                ? t("recipe.removeFavorite")
                                : t("recipe.addFavorite")
                        }
                        aria-selected={recipe.favorite}
                        onPress={() => recipes.toggleFavorite(recipe.id)}
                        style={styles.ghostButton}
                    >
                        <Star
                            size={22}
                            color={
                                recipe.favorite
                                    ? colors.primary
                                    : colors.textMuted
                            }
                            fill={
                                recipe.favorite ? colors.primary : "transparent"
                            }
                            strokeWidth={2}
                            accessible={false}
                            importantForAccessibility="no-hide-descendants"
                        />
                    </Pressable>
                    <IconButton
                        icon={Pencil}
                        variant="ghost"
                        accessibilityLabel={t("recipe.editRecipe")}
                        onPress={() =>
                            navigation.navigate("RecipeForm", {
                                recipeId: recipe.id,
                            })
                        }
                    />
                </View>
            ),
        });
    }, [recipe, t, navigation, recipes, colors]);

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

    const scaledIngredients = scaleIngredients(
        recipe.ingredients,
        recipe.servings,
        servings,
    );

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {
                        paddingBottom:
                            insets.bottom +
                            56 +
                            HORIZONTAL_PAD +
                            HORIZONTAL_PAD,
                    },
                ]}
            >
                {/* Photo area — full width, no horizontal padding */}
                <View
                    style={[
                        styles.photoContainer,
                        { backgroundColor: colors.primarySoft },
                    ]}
                >
                    {recipe.photoUri !== undefined ? (
                        <Image
                            source={{ uri: recipe.photoUri }}
                            style={styles.photo}
                            resizeMode="cover"
                            accessible={false}
                        />
                    ) : (
                        <Icon icon={UtensilsCrossed} size={40} tone="primary" />
                    )}
                </View>

                <View style={styles.padded}>
                    {/* Title */}
                    <Text variant="display" role="heading" style={styles.title}>
                        {recipe.title}
                    </Text>

                    {/* Meta row */}
                    <View style={styles.metaRow}>
                        {recipe.totalMinutes !== undefined && (
                            <View style={styles.metaItem}>
                                <Icon icon={Clock} size={14} tone="textMuted" />
                                <Text variant="caption" tone="textMuted">
                                    {formatDuration(t, recipe.totalMinutes)}
                                </Text>
                            </View>
                        )}
                        <Text variant="caption" tone="textMuted">
                            {t("recipe.steps", { count: recipe.steps.length })}
                        </Text>
                        {recipe.caloriesPerServing !== undefined && (
                            <Text variant="caption" tone="textMuted">
                                {t("recipe.calories", {
                                    count: recipe.caloriesPerServing,
                                })}
                            </Text>
                        )}
                    </View>

                    {/* Tag pills */}
                    {recipe.tags.length > 0 && (
                        <View style={styles.tagRow}>
                            {recipe.tags.map((tag) => (
                                <View
                                    key={tag}
                                    style={[
                                        styles.tagPill,
                                        { borderColor: colors.borderStrong },
                                    ]}
                                >
                                    <Text variant="label">
                                        {t(`tags.${tag}`)}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    )}

                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: colors.border },
                        ]}
                    />

                    {/* Ingredients section */}
                    <View style={styles.sectionHeader}>
                        <Text variant="headline" role="heading">
                            {t("recipe.ingredients")}
                        </Text>
                        <Stepper
                            value={servings}
                            onChange={setServings}
                            min={1}
                            max={50}
                            accessibilityLabel={t("recipe.servingsLabel")}
                            formatValue={(n) =>
                                t("recipe.servings", { count: n })
                            }
                        />
                    </View>

                    {scaledIngredients.map((ingredient, index) => {
                        let amountText: string;
                        if (ingredient.unit === "toTaste") {
                            amountText = t("units.toTaste");
                        } else if (ingredient.amount !== undefined) {
                            const { amount, unit } = ingredient;
                            // Dynamic unit key — all non-toTaste Unit values map to valid units.* i18n
                            // keys; TypeScript cannot verify template-literal keys with plural suffixes.
                            amountText = `${formatQuantity(amount, i18n.language)} ${t(`units.${unit}` as "units.g", { count: amount })}`;
                        } else {
                            amountText = "";
                        }
                        return (
                            <View key={ingredient.id}>
                                <View style={styles.ingredientRow}>
                                    <View style={styles.ingredientLeft}>
                                        <View
                                            style={[
                                                styles.dot,
                                                {
                                                    backgroundColor:
                                                        colors.primary,
                                                },
                                            ]}
                                        />
                                        <Text variant="body">
                                            {ingredient.name}
                                        </Text>
                                    </View>
                                    <Text
                                        variant="body"
                                        tone="textMuted"
                                        style={styles.amountText}
                                    >
                                        {amountText}
                                    </Text>
                                </View>
                                {index < scaledIngredients.length - 1 && (
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

                    <View
                        style={[
                            styles.divider,
                            { backgroundColor: colors.border },
                        ]}
                    />

                    {/* Steps section */}
                    <Text
                        variant="headline"
                        role="heading"
                        style={styles.sectionTitle}
                    >
                        {t("recipe.stepsTitle")}
                    </Text>

                    {recipe.steps.map((step, index) => {
                        const terms = step.ingredientIds
                            .map(
                                (id) =>
                                    recipe.ingredients.find(
                                        (ing) => ing.id === id,
                                    )?.name ?? "",
                            )
                            .filter((name) => name !== "");
                        const segments = highlightSegments(step.text, terms);

                        return (
                            <View key={step.id} style={styles.stepRow}>
                                <View
                                    style={[
                                        styles.stepBadge,
                                        {
                                            backgroundColor: colors.primarySoft,
                                        },
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
                                    {step.timer !== undefined && (
                                        <TimerBadge
                                            kind={step.timer.kind}
                                            timeLabel={formatDuration(
                                                t,
                                                step.timer.minutes,
                                            )}
                                        />
                                    )}
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Bottom bar */}
            <View
                style={[
                    styles.bottomBar,
                    {
                        backgroundColor: colors.surface,
                        borderTopColor: colors.border,
                        paddingBottom: insets.bottom + HORIZONTAL_PAD,
                    },
                ]}
            >
                <Button
                    label={t("recipe.startCooking")}
                    icon={Play}
                    onPress={() =>
                        navigation.navigate("CookingMode", {
                            recipeId: recipe.id,
                        })
                    }
                    style={styles.cookButton}
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {},
    photoContainer: {
        height: PHOTO_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
    },
    photo: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    padded: {
        paddingHorizontal: HORIZONTAL_PAD,
    },
    title: {
        marginTop: 16,
    },
    metaRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 8,
        alignItems: "center",
    },
    metaItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    tagRow: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    tagPill: {
        height: 32,
        paddingHorizontal: 12,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    divider: {
        height: 1,
        marginVertical: 20,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
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
    sectionTitle: {
        marginBottom: 16,
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
    bottomBar: {
        paddingHorizontal: HORIZONTAL_PAD,
        paddingTop: 12,
        borderTopWidth: 1,
    },
    cookButton: {
        width: "100%",
    },
    headerButtons: {
        flexDirection: "row",
        gap: 4,
    },
    ghostButton: {
        width: 44,
        height: 44,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 22,
    },
});
