// outsource dependencies
import { View, StyleSheet } from "react-native";
import { Timer, Settings } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// local dependencies
import { IconButton } from "../ui";
import type { RootStackParamList } from "./types";
import { RecipeScreen } from "../screens/RecipeScreen";
import { TimersScreen } from "../screens/TimersScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { RecipeListScreen } from "../screens/RecipeListScreen";
import { RecipeFormScreen } from "../screens/RecipeFormScreen";
import { CookingModeScreen } from "../screens/CookingModeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function RecipeListHeaderRight() {
    const navigation = useNavigation();
    return (
        <View style={styles.headerButtons}>
            <IconButton
                icon={Timer}
                variant="ghost"
                accessibilityLabel="Timers"
                onPress={() => navigation.navigate("Timers")}
            />
            <IconButton
                icon={Settings}
                variant="ghost"
                accessibilityLabel="Settings"
                onPress={() => navigation.navigate("Settings")}
            />
        </View>
    );
}

export function RootNavigator() {
    return (
        <Stack.Navigator initialRouteName="RecipeList">
            <Stack.Screen
                name="RecipeList"
                component={RecipeListScreen}
                options={{
                    title: "Recipes",
                    headerRight: RecipeListHeaderRight,
                }}
            />
            <Stack.Screen
                name="Recipe"
                component={RecipeScreen}
                options={{ title: "Recipe" }}
            />
            <Stack.Screen
                name="RecipeForm"
                component={RecipeFormScreen}
                options={({ route }) => ({
                    title:
                        route.params.recipeId !== undefined
                            ? "Edit recipe"
                            : "New recipe",
                })}
            />
            <Stack.Screen
                name="CookingMode"
                component={CookingModeScreen}
                options={{ title: "Cooking" }}
            />
            <Stack.Screen
                name="Timers"
                component={TimersScreen}
                options={{ title: "Timers" }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: "Settings" }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    headerButtons: {
        flexDirection: "row",
        gap: 4,
    },
});
