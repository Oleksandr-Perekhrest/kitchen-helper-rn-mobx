// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../theme";
import { Text, Button } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"RecipeList">;

export function RecipeListScreen({ navigation }: Props) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme();
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">{t("recipeList.title")}</Text>
            <Button
                label={t("recipeList.openDemoRecipe")}
                style={styles.button}
                onPress={() =>
                    navigation.navigate("Recipe", { recipeId: "demo" })
                }
            />
            <Button
                label={t("recipeList.newRecipe")}
                variant="secondary"
                style={styles.button}
                onPress={() => navigation.navigate("RecipeForm", {})}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, gap: 12 },
    button: { alignSelf: "flex-start" },
});
