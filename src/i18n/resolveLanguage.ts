// local dependencies
import type { LanguagePreference } from "../stores/SettingsStore";

export const SUPPORTED_LANGUAGES = ["en", "uk"] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export function resolveLanguage(
    preference: LanguagePreference,
    deviceLanguages: readonly string[],
): AppLanguage {
    if (preference === "en" || preference === "uk") return preference;
    for (const lang of deviceLanguages) {
        const code = lang.toLowerCase().split("-")[0];
        if (code === "en" || code === "uk") return code;
    }
    return "en";
}
