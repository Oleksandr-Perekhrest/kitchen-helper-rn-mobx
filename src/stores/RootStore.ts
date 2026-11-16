// local dependencies
import { persist } from "./persist";
import type { KeyValueStorage } from "../storage/types";
import {
    SettingsStore,
    parseSettings,
    SETTINGS_VERSION,
    SETTINGS_STORAGE_KEY,
} from "./SettingsStore";

export type RootStore = {
    settings: SettingsStore;
    dispose: () => void;
};

export function createRootStore(storage: KeyValueStorage): RootStore {
    const settings = new SettingsStore();

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

    return {
        settings,
        dispose: disposeSettings,
    };
}
