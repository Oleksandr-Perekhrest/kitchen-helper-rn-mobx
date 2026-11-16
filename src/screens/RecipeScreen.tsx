// outsource dependencies
import { View, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../theme";
import { Text, Button } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"Recipe">;

export function RecipeScreen({ navigation, route }: Props) {
    const { colors, spacing } = useTheme();
    const { recipeId } = route.params;
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">Recipe</Text>
            <Text variant="body">ID: {recipeId}</Text>
            <Button
                label="Edit"
                variant="secondary"
                style={styles.button}
                onPress={() => navigation.navigate("RecipeForm", { recipeId })}
            />
            <Button
                label="Start cooking"
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
