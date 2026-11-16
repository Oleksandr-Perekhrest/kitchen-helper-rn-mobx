// outsource dependencies
import { useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View, FlatList, ScrollView, StyleSheet } from "react-native";
import { Plus, Star, Clock, Users, Search } from "lucide-react-native";

// local dependencies
import { useTheme } from "../theme";
import { TAGS } from "../domain/recipe";
import type { Tag } from "../domain/recipe";
import type { Recipe } from "../domain/recipe";
import { splitMinutes } from "../domain/duration";
import { useStores } from "../stores/StoreProvider";
import { filterRecipes } from "../domain/recipeFilter";
import { Chip, Button, TextField, RecipeCard } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"RecipeList">;

const HORIZONTAL_PAD = 16;
const CARD_GAP = 12;

export const RecipeListScreen = observer(function RecipeListScreenComponent({
    navigation,
}: Props) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme();
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

    function formatMeta(recipe: Recipe): {
        text: string;
        icon: typeof Clock | typeof Users;
    } {
        if (recipe.totalMinutes !== undefined) {
            const { hours, minutes } = splitMinutes(recipe.totalMinutes);
            let text: string;
            if (hours > 0 && minutes > 0) {
                text = t("duration.hoursMinutes", { hours, minutes });
            } else if (hours > 0) {
                text = t("duration.hours", { hours });
            } else {
                text = t("duration.minutes", { minutes });
            }
            return { text, icon: Clock };
        }
        return {
            text: t("recipe.servings", { count: recipe.servings }),
            icon: Users,
        };
    }

    function renderItem({ item }: { item: Recipe }) {
        const { text: metaText, icon: metaIcon } = formatMeta(item);
        const favLabel = t("recipeList.favoriteBadge");
        const a11yParts = [item.title, metaText];
        if (item.favorite) {
            a11yParts.push(favLabel);
        }
        return (
            <View style={{ width: cardWidth }}>
                <RecipeCard
                    title={item.title}
                    meta={metaText}
                    metaIcon={metaIcon}
                    photoUri={item.photoUri}
                    favorite={item.favorite}
                    favoriteLabel={favLabel}
                    accessibilityLabel={a11yParts.join(", ")}
                    onPress={() =>
                        navigation.navigate("Recipe", { recipeId: item.id })
                    }
                />
            </View>
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
                columnWrapperStyle={styles.columnWrapper}
                ItemSeparatorComponent={() => <View style={styles.rowGap} />}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                contentContainerStyle={[
                    styles.listContent,
                    { paddingBottom: insets.bottom + 88 },
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
