// outsource dependencies
import { makeAutoObservable } from "mobx";

// local dependencies
import type { ThemePreference } from "../theme";

export type LanguagePreference = "system" | "en" | "uk";

export type SettingsSnapshot = {
    themePreference: ThemePreference;
    language: LanguagePreference;
    voiceEnabled: boolean;
    timerSoundEnabled: boolean;
};

export const SETTINGS_STORAGE_KEY = "settings";
export const SETTINGS_VERSION = 1;

function isThemePreference(val: unknown): val is ThemePreference {
    return val === "system" || val === "light" || val === "dark";
}

function isLanguagePreference(val: unknown): val is LanguagePreference {
    return val === "system" || val === "en" || val === "uk";
}

export function parseSettings(
    data: unknown,
    version: number,
): SettingsSnapshot | null {
    if (version !== SETTINGS_VERSION) return null;
    if (typeof data !== "object" || data === null || Array.isArray(data))
        return null;

    const themePreference =
        "themePreference" in data && isThemePreference(data.themePreference)
            ? data.themePreference
            : "system";

    const language =
        "language" in data && isLanguagePreference(data.language)
            ? data.language
            : "system";

    const voiceEnabled =
        "voiceEnabled" in data && typeof data.voiceEnabled === "boolean"
            ? data.voiceEnabled
            : true;

    const timerSoundEnabled =
        "timerSoundEnabled" in data &&
        typeof data.timerSoundEnabled === "boolean"
            ? data.timerSoundEnabled
            : true;

    return { themePreference, language, voiceEnabled, timerSoundEnabled };
}

export class SettingsStore {
    themePreference: ThemePreference = "system";
    language: LanguagePreference = "system";
    voiceEnabled = true;
    timerSoundEnabled = true;

    constructor() {
        makeAutoObservable(this);
    }

    setThemePreference(value: ThemePreference) {
        this.themePreference = value;
    }

    setLanguage(value: LanguagePreference) {
        this.language = value;
    }

    setVoiceEnabled(value: boolean) {
        this.voiceEnabled = value;
    }

    setTimerSoundEnabled(value: boolean) {
        this.timerSoundEnabled = value;
    }
}
