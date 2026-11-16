// local dependencies
import { persist } from "./persist";
import type { KeyValueStorage } from "../storage/types";
import { RECIPE_SCHEMA_VERSION } from "../domain/recipe";
import {
    RecipesStore,
    parseRecipes,
    RECIPES_STORAGE_KEY,
} from "./RecipesStore";
import {
    SettingsStore,
    parseSettings,
    SETTINGS_VERSION,
    SETTINGS_STORAGE_KEY,
} from "./SettingsStore";

export type RootStore = {
    settings: SettingsStore;
    recipes: RecipesStore;
    dispose: () => void;
};

export function createRootStore(storage: KeyValueStorage): RootStore {
    const settings = new SettingsStore();
    const recipes = new RecipesStore();

    const disposeSettings = persist({
        storage,
        key: SETTINGS_STORAGE_KEY,
        version: SETTINGS_VERSION,
        snapshot: () => ({
            themePreference: settings.themePreference,
            language: settings.language,
            voiceEnabled: settings.voiceEnabled,
        }),
        apply: (data) => {
            settings.setThemePreference(data.themePreference);
            settings.setLanguage(data.language);
            settings.setVoiceEnabled(data.voiceEnabled);
        },
        parse: parseSettings,
    });

    const disposeRecipes = persist({
        storage,
        key: RECIPES_STORAGE_KEY,
        version: RECIPE_SCHEMA_VERSION,
        snapshot: () => recipes.recipes,
        apply: (data) => recipes.replaceAll(data),
        parse: parseRecipes,
    });

    return {
        settings,
        recipes,
        dispose: () => {
            disposeSettings();
            disposeRecipes();
        },
    };
}
