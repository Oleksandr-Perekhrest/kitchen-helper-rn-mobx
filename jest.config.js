module.exports = {
    preset: "@react-native/jest-preset",
    setupFilesAfterEnv: ["./jest.setup.ts"],
    // Transform ESM-only packages that use the react-native exports condition.
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native(-mmkv|-notify-kit)?|@react-native(-community)?|@react-navigation|mobx(-react-lite)?)/)",
    ],
    // The preset resolver picks the react-native exports condition, which
    // resolves lucide-react-native to its .mjs ESM build. Redirect to CJS.
    moduleNameMapper: {
        "^lucide-react-native$":
            "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
    },
};
