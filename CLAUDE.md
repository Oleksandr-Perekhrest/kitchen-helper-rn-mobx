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
- Jest + React Native Testing Library
- react-native-notify-kit
- expo-speech-recognition (Expo used only as a module provider)

Entry point: `index.js` → `App.tsx`. iOS bundle target: `Cookalong` (`ios/Cookalong/`). Android package: `com.operekhrest.cookalong`.

## Conventions

**Indentation:** 4 spaces in `.ts` / `.tsx` / `.js`; 2 spaces in JSON, YAML, and Markdown.

**Imports:** two groups separated by one blank line, each preceded by a comment:

```ts
// outsource dependencies
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { observer } from "mobx-react-lite";

// local dependencies
import "./polyfills";
import { theme } from "../theme";
import { RecipeCard } from "./RecipeCard";
```

Within each group sort lines by length, shortest first. Side-effect imports go first in the local group. Named imports inside braces are also sorted by length.

**TypeScript:** strict mode; no `any`; no non-null assertions (`!`); no deep imports from `react-native/Libraries/*` (Strict TypeScript API is enabled).

Never add `eslint-disable` comments or loosen types to silence an error — use the solution recommended by the library documentation, or stop and report.

**Components:** function components and hooks only.

## Rules for the agent

- Do **not** commit, push, create branches, or run any git command that changes state — the user does all git operations.
- Do not add dependencies the task does not ask for; if one seems necessary, stop and ask.
- Use **pnpm** only; never npm or yarn.
- Do not run `nvm use` — the shell already has the correct Node version.
- Do not edit `android/` or `ios/` unless the task explicitly asks.
- Do not run native builds (`pnpm android`, `pnpm ios`, `gradlew`, `xcodebuild`, `pod install`) unless the task asks; they are slow.
