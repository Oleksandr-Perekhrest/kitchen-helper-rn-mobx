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

Planned — **do not add any of these until a task explicitly asks**:

- MobX
- React Navigation (native stack)
- react-native-mmkv
- React Hook Form + zod
- i18next (EN + UK locales)
- StyleSheet with own design tokens and light/dark theme
- Storybook (on-device + web)
- react-native-notify-kit
- expo-speech-recognition (Expo used only as a module provider)

Entry point: `index.js` → `App.tsx`. iOS bundle target: `Cookalong` (`ios/Cookalong/`). Android package: `com.operekhrest.cookalong`.

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

## CI

Workflows live in `.github/workflows/`.

- **`checks`** job (`ci.yml`, 15 min) — `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test`. Runs on `pull_request` and push to `main`.
- **`storybook`** job (`ci.yml`, 15 min) — `pnpm build-storybook`. Verifies the static build on every PR and push to `main`.
- **`android`** job (`ci.yml`, 45 min) — builds a release APK for `arm64-v8a` and `x86_64`. Signed with the template debug keystore (demo only, not for production). Uploaded as a GitHub Actions artifact named `cookalong-release-<short-sha>` with 14-day retention.
- **`PR title`** job (`pr-title.yml`) — enforces Conventional Commits format on PR titles via `amannn/action-semantic-pull-request`.
- **Vercel** (`vercel.json`) — static Storybook deployment; preview per PR, production from `main`.

## Rules for the agent

- Do **not** commit, push, create branches, or run any git command that changes state — the user does all git operations.
- Do not add dependencies the task does not ask for; if one seems necessary, stop and ask.
- Use **pnpm** only; never npm or yarn.
- Do not run `nvm use` — the shell already has the correct Node version.
- Do not edit `android/` or `ios/` unless the task explicitly asks.
- Do not run native builds (`pnpm android`, `pnpm ios`, `gradlew`, `xcodebuild`, `pod install`) unless the task asks; they are slow.

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
