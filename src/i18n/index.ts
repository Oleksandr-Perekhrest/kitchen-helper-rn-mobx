// outsource dependencies
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getLocales } from "react-native-localize";

// local dependencies
import en from "./locales/en.json";
import uk from "./locales/uk.json";
import type { AppLanguage } from "./resolveLanguage";

export function getDeviceLanguages(): string[] {
    return getLocales().map((l) => l.languageCode);
}

export function initI18n(language: AppLanguage): void {
    i18next.use(initReactI18next).init({
        lng: language,
        fallbackLng: "en",
        resources: {
            en: { translation: en },
            uk: { translation: uk },
        },
        interpolation: { escapeValue: false },
        initAsync: false,
    });
}

export { i18next as i18n };
