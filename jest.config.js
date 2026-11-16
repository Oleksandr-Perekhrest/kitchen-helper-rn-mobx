module.exports = {
    preset: "@react-native/jest-preset",
    setupFilesAfterEnv: ["./jest.setup.ts"],
    // Transform @react-navigation packages (they ship ESM) in addition to the
    // react-native packages that the preset already transforms.
    transformIgnorePatterns: [
        "node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation)/)",
    ],
    // The preset resolver picks the react-native exports condition, which
    // resolves lucide-react-native to its .mjs ESM build. Redirect to CJS.
    moduleNameMapper: {
        "^lucide-react-native$":
            "<rootDir>/node_modules/lucide-react-native/dist/cjs/lucide-react-native.js",
    },
};
