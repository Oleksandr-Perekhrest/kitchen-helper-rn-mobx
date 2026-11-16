// outsource dependencies
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "react-native-localize";

// local dependencies
import en from "./locales/en.json";
import uk from "./locales/uk.json";
import type { AppLanguage } from "./resolveLanguage";

// Language names shown in their own language — not translated so they stay
// readable regardless of which locale is currently active.
export const LANGUAGE_NATIVE_NAMES: Record<AppLanguage, string> = {
    en: "English",
    uk: "Українська",
};

export function getDeviceLanguages(): string[] {
    return getLocales().map((l) => l.languageCode);
}

export function initI18n(language: AppLanguage): void {
    // Typed as typeof en so TypeScript catches missing keys in uk.json at build time.
    const ukTranslation: typeof en = uk;
    i18next.use(initReactI18next).init({
        lng: language,
        fallbackLng: "en",
        resources: {
            en: { translation: en },
            uk: { translation: ukTranslation },
        },
        interpolation: { escapeValue: false },
        initAsync: false,
    });
}

export { i18next as i18n };
