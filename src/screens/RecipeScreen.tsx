// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../theme";
import { Text, Button } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"Recipe">;

export function RecipeScreen({ navigation, route }: Props) {
    const { t } = useTranslation();
    const { colors, spacing } = useTheme();
    const { recipeId } = route.params;
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">{t("recipe.title")}</Text>
            <Text variant="body">ID: {recipeId}</Text>
            <Button
                label={t("recipe.edit")}
                variant="secondary"
                style={styles.button}
                onPress={() => navigation.navigate("RecipeForm", { recipeId })}
            />
            <Button
                label={t("recipe.startCooking")}
                style={styles.button}
                onPress={() => navigation.navigate("CookingMode", { recipeId })}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, gap: 12 },
    button: { alignSelf: "flex-start" },
});
