// outsource dependencies
import "intl-pluralrules";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// local dependencies
import en from "../src/i18n/locales/en.json";
import uk from "../src/i18n/locales/uk.json";

const ukTranslation: typeof en = uk;

const storybookI18n = i18next.createInstance();
storybookI18n.use(initReactI18next).init({
    lng: "en",
    fallbackLng: "en",
    resources: {
        en: { translation: en },
        uk: { translation: ukTranslation },
    },
    interpolation: { escapeValue: false },
    initAsync: false,
});

export default storybookI18n;
