// outsource dependencies
import { toJS, reaction } from "mobx";

// local dependencies
import { persist } from "./persist";
import { RecipeSchema } from "../domain/recipe";
import { SnackbarStore } from "./SnackbarStore";
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
    DraftStore,
    parseDraft,
    DRAFT_VERSION,
    DRAFT_STORAGE_KEY,
} from "./DraftStore";
import {
    TimersStore,
    parseTimers,
    TIMERS_VERSION,
    TIMERS_STORAGE_KEY,
} from "./TimersStore";
import {
    SettingsStore,
    parseSettings,
    SETTINGS_VERSION,
    SETTINGS_STORAGE_KEY,
} from "./SettingsStore";
import {
    parseCookingSessions,
    CookingSessionsStore,
    COOKING_SESSIONS_VERSION,
    COOKING_SESSIONS_STORAGE_KEY,
} from "./CookingSessionsStore";

export type RootStore = {
    settings: SettingsStore;
    recipes: RecipesStore;
    draft: DraftStore;
    timers: TimersStore;
    snackbar: SnackbarStore;
    cookingSessions: CookingSessionsStore;
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
    const draft = new DraftStore();
    const timers = new TimersStore();
    const snackbar = new SnackbarStore();
    const cookingSessions = new CookingSessionsStore();

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
            timerSoundEnabled: settings.timerSoundEnabled,
        }),
        apply: (data) => {
            settings.setThemePreference(data.themePreference);
            settings.setLanguage(data.language);
            settings.setVoiceEnabled(data.voiceEnabled);
            settings.setTimerSoundEnabled(data.timerSoundEnabled);
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

    const disposeDraft = persist({
        storage,
        key: DRAFT_STORAGE_KEY,
        version: DRAFT_VERSION,
        snapshot: () => toJS(draft.draft),
        apply: (data) => {
            draft.draft = data;
        },
        parse: parseDraft,
    });

    const disposeTimers = persist({
        storage,
        key: TIMERS_STORAGE_KEY,
        version: TIMERS_VERSION,
        snapshot: () => toJS(timers.list),
        apply: (data) => timers.replaceAll(data),
        parse: parseTimers,
    });

    const disposeCookingSessions = persist({
        storage,
        key: COOKING_SESSIONS_STORAGE_KEY,
        version: COOKING_SESSIONS_VERSION,
        snapshot: () => toJS(cookingSessions.list),
        apply: (data) => cookingSessions.replaceAll(data),
        parse: parseCookingSessions,
    });

    const disposeSessionsPrune = reaction(
        () => new Set(recipes.recipes.map((r) => r.id)),
        (ids) => cookingSessions.pruneMissingRecipes(ids),
        { fireImmediately: true },
    );

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
        draft,
        timers,
        snackbar,
        cookingSessions,
        dispose: () => {
            disposeSettings();
            disposeRecipes();
            disposeDraft();
            disposeTimers();
            disposeCookingSessions();
            disposeSessionsPrune();
            snackbar.dispose();
        },
    };
}

export function referencedPhotoFiles(store: RootStore): Set<string> {
    const files = new Set<string>();
    for (const recipe of store.recipes.recipes) {
        if (recipe.photoFile !== undefined) {
            files.add(recipe.photoFile);
        }
    }
    if (store.draft.draft?.values.photoFile !== undefined) {
        files.add(store.draft.draft.values.photoFile);
    }
    return files;
}
