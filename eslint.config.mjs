// outsource dependencies
import prettierConfig from "eslint-config-prettier";
import rnFlatConfig from "@react-native/eslint-config/flat";
import perfectionistPlugin from "eslint-plugin-perfectionist";

export default [
    {
        ignores: [
            "node_modules/**",
            "android/**",
            "ios/**",
            "vendor/**",
            "coverage/**",
            "dist/**",
            "build/**",
            "storybook-static/**",
        ],
    },

    ...rnFlatConfig,

    {
        // eslint-plugin-ft-flow from the RN preset calls context.getAllComments(),
        // which was removed in ESLint 9, and crashes on every .js file.
        // The project has no Flow types, so these rules are switched off.
        files: ["**/*.js"],
        rules: {
            "ft-flow/define-flow-type": "off",
            "ft-flow/use-flow-type": "off",
        },
    },

    {
        plugins: {
            perfectionist: perfectionistPlugin,
        },
        rules: {
            "perfectionist/sort-imports": [
                "error",
                {
                    type: "line-length",
                    order: "asc",
                    sortSideEffects: false,
                    newlinesBetween: 0,
                    groups: [
                        {
                            group: [
                                "value-builtin",
                                "type-builtin",
                                "value-external",
                                "type-external",
                            ],
                            commentAbove: "outsource dependencies",
                        },
                        { newlinesBetween: 1 },
                        {
                            group: [
                                "type-internal",
                                "value-internal",
                                "type-parent",
                                "value-parent",
                                "type-sibling",
                                "value-sibling",
                                "type-index",
                                "value-index",
                            ],
                            commentAbove: "local dependencies",
                        },
                    ],
                },
            ],
            "perfectionist/sort-named-imports": [
                "error",
                {
                    type: "line-length",
                    order: "asc",
                },
            ],
        },
    },

    prettierConfig,
];
