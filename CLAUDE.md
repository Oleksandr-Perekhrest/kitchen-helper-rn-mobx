# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Cookalong** — a React Native kitchen helper app. Package manager is **pnpm** (required; do not use npm or yarn). Node >= 24.

Bare React Native 0.88 app (no Expo framework; New Architecture enabled) targeting Android and iOS. Public portfolio project.

## Commands

```sh
pnpm start          # Metro dev server
pnpm android        # Run on Android emulator/device
pnpm ios            # Run on iOS simulator/device
pnpm test           # Run Jest suite
pnpm test <pattern> # Run a single test file
pnpm lint           # ESLint
pnpm typecheck      # TypeScript type-check (tsc --noEmit)
pnpm format         # Prettier write
pnpm format:check   # Prettier check (CI)
pnpm storybook      # Storybook dev server (web, port 6006)
pnpm build-storybook # Storybook static build → storybook-static/
```

**Checks before finishing any task:** `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test` (skip a script that does not exist yet and say so in the report).

Git hooks (lefthook): pre-commit runs ESLint + Prettier on staged files; pre-push runs the full check suite above.

iOS CocoaPods deps are installed automatically by `pnpm ios`. Manual install only if needed:

```sh
cd ios && bundle exec pod install
```

## Stack

**In use:**

- React Native 0.88 (bare, New Architecture)
- StyleSheet with own design tokens and light/dark theme (`src/theme`: tokens, typography, shadows, ThemeProvider with a controlled `preference` prop)
- Manrope font linked natively with @callstack/react-native-asset (`assets/fonts`, `react-native.config.js`; `fontFamily "Manrope"` + `fontWeight` on both platforms)
- react-native-svg + lucide-react-native for icons
- React Navigation (native stack) with react-native-screens + react-native-safe-area-context (`src/navigation`: RootNavigator, route types, navigation theme hook)
- MobX 7 + mobx-react-lite — observable settings and recipes stores; `persist` helper with versioned `{ version, data }` envelope
- react-native-mmkv 4 (Nitro-based) — synchronous key-value storage backing the settings and recipes stores
- zod 4 — data model schemas in `src/domain`; persisted data is validated with these schemas on read (invalid records are dropped, not rejected wholesale)
- web-only Storybook 10 with @storybook/react-native-web-vite (`stories/`, addons Docs and a11y, default viewport "Cookalong · 390×844")
- i18next 26 + react-i18next + react-native-localize — EN and UK locales bundled as JSON resources; `resolveLanguage` resolves `LanguagePreference` → `AppLanguage`; typed keys via `src/i18n/i18next.d.ts` augmentation
- Expo Modules SDK 58 — used only as a native module provider (no Expo CLI, no `expo start` or `expo run`; Metro and Babel remain the RN defaults); `expo-*` packages are added with the version range listed in `node_modules/expo/bundledNativeModules.json`
- react-native-notify-kit 10 — maintained Notifee-compatible fork; used only via `src/notifications` (stores must not import it directly)

**Planned — do not add any of these until a task explicitly asks:**

- React Hook Form
- expo-speech-recognition (Expo used only as a module provider)

Entry point: `index.js` → `App.tsx`. iOS bundle target: `Cookalong` (`ios/Cookalong/`). Android package: `com.operekhrest.cookalong`.

## Structure

- `src/theme` — tokens and theme
- `src/ui` — presentational UI components (no stores or navigation inside)
- `src/hooks` — shared hooks
- `src/navigation` — navigator (`RootNavigator`), route types (`types.ts`), navigation theme hook (`useNavigationTheme.ts`), `navigationRef.ts` (navigates from outside React)
- `src/screens` — one file per screen; screens may use stores and navigation, `src/ui` may not
- `src/domain` — data model and zod schemas (no React, no MobX); `recipe.ts` exports `RecipeSchema`, `UNITS`, `TAGS`, and inferred types; `cookingSession.ts` exports `CookingSessionSchema` and `CookingSession`
- `src/storage` — `KeyValueStorage` interface, MMKV adapter (`mmkvStorage.ts`), in-memory adapter for tests (`memoryStorage.ts`)
- `src/i18n` — i18next setup: `index.ts` (init + `getDeviceLanguages`), `resolveLanguage.ts`, `i18next.d.ts` (typed keys), `locales/en.json` and `locales/uk.json`
- `src/stores` — MobX stores (`SettingsStore`, `RecipesStore`, `TimersStore`, `DraftStore`, `CookingSessionsStore`, `RootStore`), `persist` helper, `StoreProvider` context; `SettingsStore`, `RecipesStore`, `TimersStore`, `DraftStore`, and `CookingSessionsStore` are all persisted to MMKV via `persist`; `CookingSessionsStore` keeps one session per recipe keyed by recipeId and is pruned when its recipe is deleted; `timerNotificationsSync.ts` keeps notifications in sync with timers
- `src/notifications` — `TimerNotifier` interface (`types.ts`), notify-kit adapter (`notifyKitNotifier.ts`), `openTarget.ts` (pure tap → screen resolution), `openEvents.ts` (tap events; the only module besides the adapter that imports react-native-notify-kit), `exactAlarmPrompt.ts` (system-settings dialog); stores must not import react-native-notify-kit directly
- `src/dev` — dev-only screens and tools; reachable only when `__DEV__` is true; English literals allowed, no i18n required
- `stories/` — Storybook stories mirroring `src/`
- `__tests__/` — tests mirroring `src/`
- `assets/fonts` — font files; `assets/licenses` for their licenses

## Conventions

**Indentation:** 4 spaces in `.ts` / `.tsx` / `.js`; 2 spaces in JSON, YAML, and Markdown.

**Imports** are enforced by `eslint-plugin-perfectionist` (`sort-imports` and `sort-named-imports`, type `line-length`). Write them correctly the first time:

1. Two groups in this order, each preceded by its comment, one blank line between them:
   - `// outsource dependencies`: packages (`react`, `react-native`, any npm package), including `import type` from packages.
   - `// local dependencies`: relative paths (`./`, `../`), including `import type`.
2. Inside a group, sort import statements by the length of the **whole line**, shortest first. Not alphabetically and not by package name: `react-native` goes before `react` when its line is shorter. `import type` lines are sorted together with value imports by the same rule.
3. Inside braces, sort named imports by their own length, shortest first: `{ useMemo, useContext, createContext }`.
4. Side-effect imports (`import "./polyfills";`) go first in the local group; ESLint does not check their position.
5. Equal lengths may stay in any order.
6. Length ordering applies **only** to imports. Object keys, JSX props, union members and token scales keep a meaningful order (e.g. a type scale from largest to smallest).

```ts
// outsource dependencies
import { useColorScheme } from "react-native";
import { useMemo, useContext, createContext } from "react";

// local dependencies
import "./polyfills";
import type { ThemeColors } from "./tokens";
import { radii, spacing, darkColors, lightColors } from "./tokens";
```

After writing or editing files, run `pnpm exec eslint --fix <changed files>` and then `pnpm format` before the full check. Both perfectionist rules are autofixable. Do not read `eslint.config.mjs` to work out the order by hand.

Within each group sort lines by length, shortest first. Side-effect imports go first in the local group. Named imports inside braces are also sorted by length.

**TypeScript:** strict mode; no `any`; no non-null assertions (`!`); no deep imports from `react-native/Libraries/*` (Strict TypeScript API is enabled).

Never add `eslint-disable` comments or loosen types to silence an error — use the solution recommended by the library documentation, or stop and report.

**Components:** function components and hooks only.

**Notifications:**

- Timers are persisted in MMKV; finished timers are kept until the user removes them.
- Notification id = timer id: the ongoing countdown (Android) and the "time's up" alert share it, so the alert replaces the countdown and `cancel(id)` removes both.
- Three Android channels: `timers` (sound), `timers-silent`, `timers-ongoing` (low importance); channel sound cannot change after creation, hence the separate silent channel for the sound toggle.
- Exact alarms: `USE_EXACT_ALARM` in the app manifest (granted at install on Android 13+; Play allows it for timer apps); if exact alarms are still not allowed, a one-time-per-session dialog opens the system setting.
- Permission is requested on the first upcoming timer, not at launch.
- The background press handler is registered in `index.js` at module load.
- iOS has no ongoing countdown (needs Live Activities, in the backlog).

**Accessibility props:** use the React Native ARIA props — `role`, `aria-label`, `aria-checked`, `aria-selected`, `aria-disabled`, `aria-busy`, `aria-expanded`, `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext` — instead of the legacy `accessibilityRole`, `accessibilityState`, `accessibilityValue` and `accessibilityLabel`. They work on iOS and Android and react-native-web maps them 1:1 to the DOM, while the legacy props lose state on the web (e.g. no `aria-checked` on a switch). Check every story's Accessibility tab: 0 violations.

## Testing

**Stack:** Jest + React Native Testing Library. Tests live in the root `__tests__/` folder mirroring the source structure (e.g. `__tests__/features/timers/remaining.test.ts` for `src/features/timers/remaining.ts`).

**Style:** import `describe`, `it`, `expect` from `@jest/globals` explicitly; use RNTL `screen` queries (`getByText`, `getByRole`, etc.); no snapshot tests; no global coverage threshold.

**What is tested (critical modules only):**

- Portion scaling — fractions without rounding (e.g. 1.5 eggs)
- Timers — remaining time from timestamps, restore after app restart
- `matchCommand(text, locale)` — voice command matching in EN and UK
- Recipe zod schemas — form wizard step validation
- MobX ↔ MMKV persistence — serialization and demo-data format migration
- Language selection — system language default, saved choice wins
- Key UI flows via RNTL — cooking mode next/back; saving a recipe from the wizard

**What is not unit-tested:**

- Presentational components (Storybook covers them)
- Styles
- Thin wrappers over native libraries (covered by E2E later)

Do not write tests for anything outside the critical list unless the task explicitly asks.

**Jest vs Metro divergence:** Jest resolves the CommonJS build of a package while Metro uses its ESM build. A green test run does not prove the app bundles. After adding a JS dependency that ships an ESM entry point, verify that `pnpm start` (Metro) bundles without errors before closing the task.

## CI

Workflows live in `.github/workflows/`.

- **`checks`** job (`ci.yml`, 15 min) — `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Runs on `pull_request` and push to `main`.
- **`storybook`** job (`ci.yml`, 15 min) — `pnpm build-storybook`. Verifies the static build on every PR and push to `main`.
- **`android`** job (`ci.yml`, 45 min) — builds a release APK for `arm64-v8a` and `x86_64`. Signed with the template debug keystore (demo only, not for production). Uploaded as a GitHub Actions artifact named `cookalong-release-<short-sha>` with 14-day retention.
- **`PR title`** job (`pr-title.yml`) — enforces Conventional Commits format on PR titles via `amannn/action-semantic-pull-request`.
- **Vercel** (`vercel.json`) — static Storybook deployment; preview per PR, production from `main`.

## Rules for the agent

- Stores depend on `KeyValueStorage` (from `src/storage/types.ts`), never on MMKV directly — this keeps stores testable with `createMemoryStorage`.
- Do **not** commit, push, create branches, or run any git command that changes state — the user does all git operations.
- Do not add dependencies the task does not ask for; if one seems necessary, stop and ask.
- Use **pnpm** only; never npm or yarn.
- Do not run `nvm use` — the shell already has the correct Node version.
- Do not edit `android/` or `ios/` unless the task explicitly asks.
- Do not run native builds (`pnpm android`, `pnpm ios`, `gradlew`, `xcodebuild`, `pod install`) unless the task asks; they are slow.
- After adding a native dependency, running `cd ios && bundle exec pod install` is the user's job — say in the report that pods must be installed; `pnpm ios` does not always install new pods.
- No hard-coded user-visible strings in `src/screens` or `src/navigation` — always use `t()` from `useTranslation()`. `src/ui` components receive text via props. Exception: `src/dev` files are developer-facing and may use English string literals directly.
- Every new i18n key must be added to both `src/i18n/locales/en.json` and `src/i18n/locales/uk.json`.

## Storybook stories

- Stories live in `stories/`, mirroring `src/` (`stories/ui/Button.stories.tsx` for `src/ui/Button.tsx`). Import `Meta` and `StoryObj` from `@storybook/react-native-web-vite`.
- `meta.args` holds a valid value for **every required prop**; callbacks use `fn()` from `storybook/test`. Stories override only what differs: `export const Disabled: Story = { args: { disabled: true } };`
- Prefer args-only stories. Use `render` only when the story needs extra layout around the component or interactive state, and always pass `args` through to the component — never ignore them.
- Controlled components (`value` + `onChange`): keep the state in Storybook args with `useArgs`, not in a local `useState`, so the canvas and the Controls panel stay in sync. Call the original callback too, so the Actions panel logs it:

```tsx
import { useArgs } from "storybook/preview-api";

export const Interactive: Story = {
  render: function Render(args) {
    const [, updateArgs] = useArgs<typeof args>();
    return (
      <Stepper
        {...args}
        onChange={(value) => {
          args.onChange(value);
          updateArgs({ value });
        }}
      />
    );
  },
};
```

- `render` is a named function (`function Render`) so hooks inside it satisfy the rules of hooks.
