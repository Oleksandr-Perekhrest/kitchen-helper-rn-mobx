// outsource dependencies
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { View, StyleSheet } from "react-native";
import { Timer, Settings } from "lucide-react-native";
import { useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// local dependencies
import { useTheme } from "../theme";
import { Text, IconButton } from "../ui";
import type { RootStackParamList } from "./types";
import { useStores } from "../stores/StoreProvider";
import { RecipeScreen } from "../screens/RecipeScreen";
import { TimersScreen } from "../screens/TimersScreen";
import { UiGalleryScreen } from "../dev/UiGalleryScreen";
import { SettingsScreen } from "../screens/SettingsScreen";
import { RecipeListScreen } from "../screens/RecipeListScreen";
import { RecipeFormScreen } from "../screens/RecipeFormScreen";
import { CookingModeScreen } from "../screens/CookingModeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const RecipeListHeaderRight = observer(
    function RecipeListHeaderRightComponent() {
        const navigation = useNavigation();
        const { t } = useTranslation();
        const { colors } = useTheme();
        const { timers } = useStores();
        const count = timers.list.length;
        const timersLabel =
            count > 0
                ? t("navigation.timersButtonCount", { count })
                : t("navigation.timersButton");
        return (
            <View style={styles.headerButtons}>
                <View style={styles.timersButton}>
                    <IconButton
                        icon={Timer}
                        variant="ghost"
                        accessibilityLabel={timersLabel}
                        onPress={() => navigation.navigate("Timers")}
                    />
                    {count > 0 && (
                        <View
                            aria-hidden={true}
                            pointerEvents="none"
                            style={[
                                styles.badge,
                                { backgroundColor: colors.primary },
                            ]}
                        >
                            <Text tone="onPrimary" style={styles.badgeText}>
                                {String(count)}
                            </Text>
                        </View>
                    )}
                </View>
                <IconButton
                    icon={Settings}
                    variant="ghost"
                    accessibilityLabel={t("navigation.settingsButton")}
                    onPress={() => navigation.navigate("Settings")}
                />
            </View>
        );
    },
);

function renderRecipeListHeaderRight() {
    return <RecipeListHeaderRight />;
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
                    headerRight: renderRecipeListHeaderRight,
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
    timersButton: {
        position: "relative",
    },
    badge: {
        position: "absolute",
        top: 0,
        right: 0,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: "700",
        lineHeight: 14,
    },
});
