// outsource dependencies
import type { StorybookConfig } from "@storybook/react-native-web-vite";

// Extension priority copied verbatim from `vite-plugin-rnw`'s source
// (node_modules/vite-plugin-rnw/dist/index.mjs: `const extensions = [...]`).
// The plugin installs this list on the main dev resolver via `resolve.extensions`,
// but Vite 8's Rolldown-backed dep optimizer does not inherit it, so without
// re-applying it to `optimizeDeps.rolldownOptions.resolve.extensions` the
// optimizer resolves `.js` first and pulls in the native React Native source
// of `react-native-svg` (its `fabric/*NativeComponent` files, which import
// `TurboModuleRegistry` from `react-native` → aliased to `react-native-web`,
// where it does not exist). Prepending `.web.*` makes it pick the sibling
// `*.web.js` files that skip the fabric/native branch.
const RNW_RESOLVE_EXTENSIONS = [
    ".web.mjs",
    ".web.js",
    ".web.mts",
    ".web.ts",
    ".web.tsx",
    ".web.cjs",
    ".mjs",
    ".js",
    ".jsx",
    ".json",
    ".mts",
    ".ts",
    ".tsx",
    ".cjs",
];

const config: StorybookConfig = {
    stories: ["../stories/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
    framework: {
        name: "@storybook/react-native-web-vite",
        options: {},
    },
    core: {
        disableWhatsNewNotifications: true,
    },
    features: {
        sidebarOnboardingChecklist: false,
        menuOnboardingChecklist: false,
    },
    staticDirs: [{ from: "../assets/fonts", to: "/fonts" }],
    async viteFinal(viteConfig) {
        viteConfig.optimizeDeps ??= {};
        viteConfig.optimizeDeps.rolldownOptions ??= {};
        viteConfig.optimizeDeps.rolldownOptions.resolve ??= {};
        viteConfig.optimizeDeps.rolldownOptions.resolve.extensions =
            RNW_RESOLVE_EXTENSIONS;
        // `vite-plugin-rnw` enables `shimMissingExports` for its build output
        // (see its `getBuildOptions` in node_modules) but not for the dep
        // optimizer. Mirror it here: `react-native-svg/lib/module/lib/
        // SvgTouchableMixin.js` — reached from the web chain via
        // `web/WebShape.js` — does a lazy `require('../fabric/NativeSvgSoundModule')`,
        // and that file has no `.web.js` sibling, so it imports
        // `TurboModuleRegistry` from react-native-web, which does not export
        // it. Shimming turns that missing export into `undefined` (the
        // `playTouchSound` branch is Android-only runtime code that never
        // fires on web) instead of crashing the optimizer.
        viteConfig.optimizeDeps.rolldownOptions.shimMissingExports = true;

        // Still needed: with the extension fix above the optimizer resolves
        // `react-native-svg/lib/module/lib/resolveAssetUri.web.js`, which in
        // turn imports `@react-native/assets-registry/registry`. React Native
        // 0.87+ no longer ships that package, but react-native-web exposes an
        // equivalent registry with the same `getAssetByID` signature.
        viteConfig.resolve ??= {};
        viteConfig.resolve.alias = {
            ...(viteConfig.resolve.alias as Record<string, string> | undefined),
            "@react-native/assets-registry/registry":
                "react-native-web/dist/modules/AssetRegistry/index.js",
        };

        return viteConfig;
    },
};

export default config;
