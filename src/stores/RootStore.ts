// outsource dependencies
import { toJS } from "mobx";

// local dependencies
import { persist } from "./persist";
import { RecipeSchema } from "../domain/recipe";
import { getDemoRecipes } from "../data/demoRecipes";
import type { KeyValueStorage } from "../storage/types";
import { RECIPE_SCHEMA_VERSION } from "../domain/recipe";
import { resolveLanguage, SUPPORTED_LANGUAGES } from "../i18n/resolveLanguage";
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

export type RootStoreOptions = {
    deviceLanguages: readonly string[];
    now?: () => Date;
};

export function createRootStore(
    storage: KeyValueStorage,
    options: RootStoreOptions,
): RootStore {
    const settings = new SettingsStore();
    const recipes = new RecipesStore();

    // Key absent means the app has never written recipe data (true first launch).
    // Once persist() writes the key (even as an empty array after user deletes all),
    // this stays false — so user deletions and corrupt envelopes never re-seed.
    const isFirstLaunch = storage.getString(RECIPES_STORAGE_KEY) === undefined;

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
        // toJS dereferences every nested observable so MobX tracks field-level
        // mutations (add, update) and not just array reference replacements.
        snapshot: () => toJS(recipes.recipes),
        apply: (data) => recipes.replaceAll(data),
        parse: parseRecipes,
    });

    if (isFirstLaunch) {
        const now = (options.now ?? (() => new Date()))();
        const language = resolveLanguage(
            settings.language,
            options.deviceLanguages,
        );

        if (__DEV__) {
            for (const lang of SUPPORTED_LANGUAGES) {
                for (const recipe of getDemoRecipes(lang, now)) {
                    const result = RecipeSchema.safeParse(recipe);
                    if (!result.success) {
                        console.error(
                            "[demoRecipes] invalid demo recipe:",
                            result.error.issues,
                        );
                    }
                }
            }
        }

        recipes.replaceAll(getDemoRecipes(language, now));
    }

    return {
        settings,
        recipes,
        dispose: () => {
            disposeSettings();
            disposeRecipes();
        },
    };
}
