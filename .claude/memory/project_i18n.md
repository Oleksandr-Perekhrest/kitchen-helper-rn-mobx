---
name: i18n stack wired up
description: i18next 26 + react-i18next + react-native-localize integrated; EN + UK locales bundled; language resolved from SettingsStore preference and device locale
type: project
---

i18next initialised synchronously via `initAsync: false` (option from `i18next/typescript/options.d.ts`). `initI18n` called in App's useState initializer; `i18n.changeLanguage` called in a ThemedApp effect when settings.language changes.

**Why:** SettingsStore.language (`"system" | "en" | "uk"`) drives app language; device locale used as fallback when preference is "system".

**How to apply:** All user-visible strings in src/screens and src/navigation go through `t()` from `useTranslation()`. src/ui components receive text via props. Every new key must be in both en.json and uk.json. Jest mocks react-native-localize via `jest.requireActual("react-native-localize/mock")` in jest.setup.ts.
