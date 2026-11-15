// outsource dependencies
import type { StorybookConfig } from "@storybook/react-native-web-vite";

const config: StorybookConfig = {
    stories: ["../stories/**/*.stories.@(ts|tsx)"],
    addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
    framework: {
        name: "@storybook/react-native-web-vite",
        options: {},
    },
    staticDirs: [{ from: "../assets/fonts", to: "/fonts" }],
};

export default config;
