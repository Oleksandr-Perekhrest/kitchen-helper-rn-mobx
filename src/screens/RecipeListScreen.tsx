// outsource dependencies
import { View, StyleSheet } from "react-native";

// local dependencies
import { useTheme } from "../theme";
import { Text, Button } from "../ui";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"RecipeList">;

export function RecipeListScreen({ navigation }: Props) {
    const { colors, spacing } = useTheme();
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">Recipe List</Text>
            <Button
                label="Open demo recipe"
                style={styles.button}
                onPress={() =>
                    navigation.navigate("Recipe", { recipeId: "demo" })
                }
            />
            <Button
                label="New recipe"
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
