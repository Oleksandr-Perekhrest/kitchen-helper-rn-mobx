// outsource dependencies
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { Timer, Settings } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// local dependencies
import { IconButton } from "../ui";
import type { RootStackParamList } from "./types";
import { RecipeScreen } from "../screens/RecipeScreen";
import { TimersScreen } from "../screens/TimersScreen";
import { UiGalleryScreen } from "../dev/UiGalleryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { RecipeListScreen } from "../screens/RecipeListScreen";
import { RecipeFormScreen } from "../screens/RecipeFormScreen";
import { CookingModeScreen } from "../screens/CookingModeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

function RecipeListHeaderRight() {
    const navigation = useNavigation();
    const { t } = useTranslation();
    return (
        <View style={styles.headerButtons}>
            <IconButton
                icon={Timer}
                variant="ghost"
                accessibilityLabel={t("navigation.timersButton")}
                onPress={() => navigation.navigate("Timers")}
            />
            <IconButton
                icon={Settings}
                variant="ghost"
                accessibilityLabel={t("navigation.settingsButton")}
                onPress={() => navigation.navigate("Settings")}
            />
        </View>
    );
}

export function RootNavigator() {
    const { t } = useTranslation();
    return (
        <Stack.Navigator
            initialRouteName="RecipeList"
            screenOptions={{
                headerTitleStyle: { fontFamily: "Manrope", fontWeight: "700" },
                headerBackButtonDisplayMode: "minimal",
            }}
        >
            <Stack.Screen
                name="RecipeList"
                component={RecipeListScreen}
                options={{
                    title: t("recipeList.title"),
                    headerRight: RecipeListHeaderRight,
                }}
            />
            <Stack.Screen
                name="Recipe"
                component={RecipeScreen}
                options={{ title: t("recipe.title") }}
            />
            <Stack.Screen
                name="RecipeForm"
                component={RecipeFormScreen}
                options={({ route }) => ({
                    title:
                        route.params.recipeId !== undefined
                            ? t("recipeForm.titleEdit")
                            : t("recipeForm.titleNew"),
                })}
            />
            <Stack.Screen
                name="CookingMode"
                component={CookingModeScreen}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Timers"
                component={TimersScreen}
                options={{ title: t("timers.title") }}
            />
            <Stack.Screen
                name="Settings"
                component={SettingsScreen}
                options={{ title: t("settings.title") }}
            />
            {__DEV__ && (
                <Stack.Screen
                    name="UiGallery"
                    component={UiGalleryScreen}
                    options={{ title: "UI gallery" }}
                />
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    headerButtons: {
        flexDirection: "row",
        gap: 4,
    },
});
