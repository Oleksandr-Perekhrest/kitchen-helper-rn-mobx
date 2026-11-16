// outsource dependencies
import { View, StyleSheet } from "react-native";

// local dependencies
import { Text } from "../ui";
import { useTheme } from "../theme";
import type { RootStackScreenProps } from "../navigation/types";

type Props = RootStackScreenProps<"RecipeForm">;

export function RecipeFormScreen({ route }: Props) {
    const { colors, spacing } = useTheme();
    const { recipeId } = route.params;
    return (
        <View
            style={[
                styles.container,
                { backgroundColor: colors.background, padding: spacing[16] },
            ]}
        >
            <Text variant="headline">
                {recipeId !== undefined ? "Edit recipe" : "New recipe"}
            </Text>
            {recipeId !== undefined && (
                <Text variant="body">ID: {recipeId}</Text>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
});
