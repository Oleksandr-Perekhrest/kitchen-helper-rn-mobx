// outsource dependencies
import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, FlatList, ScrollView, StyleSheet } from "react-native";
import { Star, Plus, Search, SearchX, BookOpen } from "lucide-react-native";

// local dependencies
import { TAGS } from "../domain/recipe";
import type { Tag } from "../domain/recipe";
import { spacing, useTheme } from "../theme";
import type { Recipe } from "../domain/recipe";
import { splitMinutes } from "../domain/duration";
import { useStores } from "../stores/StoreProvider";
import { filterRecipes } from "../domain/recipeFilter";
import type { RootStackScreenProps } from "../navigation/types";
import { Chip, Button, TextField, RecipeCard, EmptyState } from "../ui";

type Props = RootStackScreenProps<"RecipeList">;

const HORIZONTAL_PAD = 16;
const CARD_GAP = 12;
// FAB height (56) + its spacing[16] bottom inset + spacing[16] gap above it
const LIST_BOTTOM_PAD = 56 + spacing[16] + spacing[16];

function ItemSeparator() {
    return <View style={styles.rowGap} />;
}

export const RecipeListScreen = observer(function RecipeListScreenComponent({
    navigation,
}: Props) {
    const { t } = useTranslation();
    const { colors } = useTheme();
    const { recipes } = useStores();
    const insets = useSafeAreaInsets();
    const { width: screenWidth } = useWindowDimensions();

    const [query, setQuery] = useState("");
    const [tag, setTag] = useState<Tag | null>(null);
    const [favoritesOnly, setFavoritesOnly] = useState(false);

    const totalCount = recipes.recipes.length;
    const favoritesCount = recipes.favorites.length;
    const filtered = filterRecipes(recipes.recipes, {
        query,
        tag,
        favoritesOnly,
    });

    const cardWidth = (screenWidth - HORIZONTAL_PAD * 2 - CARD_GAP) / 2;

    function renderItem({ item }: { item: Recipe }) {
        let duration: string | undefined;
        if (item.totalMinutes !== undefined) {
            const { hours, minutes } = splitMinutes(item.totalMinutes);
            if (hours > 0 && minutes > 0) {
                duration = t("duration.hoursMinutes", { hours, minutes });
            } else if (hours > 0) {
                duration = t("duration.hours", { hours });
            } else {
                duration = t("duration.minutes", { minutes });
            }
        }
        const servings = t("recipe.servings", { count: item.servings });
        const favLabel = t("recipeList.favoriteBadge");
        const a11yParts = [item.title, servings];
        if (duration !== undefined) a11yParts.push(duration);
        if (item.favorite) a11yParts.push(favLabel);
        return (
            <View style={{ width: cardWidth }}>
                <RecipeCard
                    title={item.title}
                    duration={duration}
                    servings={servings}
                    photoUri={item.photoUri}
                    favorite={item.favorite}
                    accessibilityLabel={a11yParts.join(", ")}
                    onPress={() =>
                        navigation.navigate("Recipe", { recipeId: item.id })
                    }
                />
            </View>
        );
    }

    let listEmpty: React.ReactElement;
    if (totalCount === 0) {
        listEmpty = (
            <EmptyState
                icon={BookOpen}
                title={t("recipeList.empty.noRecipes.title")}
                description={t("recipeList.empty.noRecipes.description")}
            />
        );
    } else if (favoritesOnly && favoritesCount === 0) {
        listEmpty = (
            <EmptyState
                icon={Star}
                title={t("recipeList.empty.noFavorites.title")}
                description={t("recipeList.empty.noFavorites.description")}
                actionLabel={t("recipeList.empty.noFavorites.action")}
                onAction={() => setFavoritesOnly(false)}
            />
        );
    } else {
        listEmpty = (
            <EmptyState
                icon={SearchX}
                title={t("recipeList.empty.noResults.title")}
                description={t("recipeList.empty.noResults.description")}
                actionLabel={t("recipeList.empty.noResults.action")}
                onAction={() => {
                    setQuery("");
                    setTag(null);
                    setFavoritesOnly(false);
                }}
            />
        );
    }

    const listHeader = (
        <View>
            <View
                style={[
                    styles.headerSection,
                    {
                        paddingHorizontal: spacing[16],
                        paddingTop: spacing[16],
                        paddingBottom: CARD_GAP,
                    },
                ]}
            >
                <TextField
                    icon={Search}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={t("recipeList.search")}
                    aria-label={t("recipeList.search")}
                    returnKeyType="search"
                    clearButtonMode="while-editing"
                />
            </View>
            <View
                role="radiogroup"
                aria-label={t("recipeList.filterLabel")}
                style={[
                    styles.filterRow,
                    {
                        paddingHorizontal: spacing[16],
                        paddingBottom: CARD_GAP,
                    },
                ]}
            >
                <Chip
                    label={t("recipeList.all", { count: totalCount })}
                    selected={!favoritesOnly}
                    role="radio"
                    onPress={() => setFavoritesOnly(false)}
                />
                <Chip
                    label={t("recipeList.favorites", { count: favoritesCount })}
                    selected={favoritesOnly}
                    icon={Star}
                    role="radio"
                    onPress={() => setFavoritesOnly(true)}
                />
            </View>
            <View role="group" aria-label={t("recipeList.tagGroupLabel")}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.tagScroll,
                        { paddingLeft: spacing[16] },
                    ]}
                >
                    {TAGS.map((tagKey) => (
                        <Chip
                            key={tagKey}
                            label={t(`tags.${tagKey}`)}
                            selected={tag === tagKey}
                            onPress={() =>
                                setTag(tag === tagKey ? null : tagKey)
                            }
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );

    return (
        <View
            style={[styles.container, { backgroundColor: colors.background }]}
        >
            <FlatList
                data={filtered}
                numColumns={2}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={listHeader}
                ListEmptyComponent={listEmpty}
                columnWrapperStyle={styles.columnWrapper}
                ItemSeparatorComponent={ItemSeparator}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + LIST_BOTTOM_PAD },
                ]}
            />
            <View
                style={[
                    styles.fab,
                    { right: spacing[20], bottom: insets.bottom + spacing[16] },
                ]}
                pointerEvents="box-none"
            >
                <Button
                    label={t("recipeList.newRecipe")}
                    icon={Plus}
                    onPress={() => navigation.navigate("RecipeForm", {})}
                />
            </View>
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerSection: {},
    filterRow: { flexDirection: "row", gap: 8 },
    tagScroll: {
        gap: 8,
        paddingBottom: CARD_GAP,
        paddingRight: HORIZONTAL_PAD,
    },
    columnWrapper: { gap: CARD_GAP, paddingHorizontal: HORIZONTAL_PAD },
    rowGap: { height: CARD_GAP },
    listContent: { paddingTop: CARD_GAP },
    fab: { position: "absolute" },
});
