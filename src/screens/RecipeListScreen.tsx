// outsource dependencies
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../theme";
import { Text, Button } from "../ui";
import { useStores } from "../stores/StoreProvider";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"RecipeList">;

export const RecipeListScreen = observer(function RecipeListScreenComponent({
    navigation,
}: Props) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme();
    const { recipes } = useStores();
    const firstRecipe = recipes.recipes[0];
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">{t("recipeList.title")}</Text>
            {recipes.recipes.map((recipe) => (
                <Text key={recipe.id}>{recipe.title}</Text>
            ))}
            {firstRecipe !== undefined && (
                <Button
                    label={t("recipeList.openDemoRecipe")}
                    style={styles.button}
                    onPress={() =>
                        navigation.navigate("Recipe", {
                            recipeId: firstRecipe.id,
                        })
                    }
                />
            )}
            <Button
                label={t("recipeList.newRecipe")}
                variant="secondary"
                style={styles.button}
                onPress={() => navigation.navigate("RecipeForm", {})}
            />
        </View>
    );
});

const styles = StyleSheet.create({
    container: { flex: 1, gap: 12 },
    button: { alignSelf: "flex-start" },
});
