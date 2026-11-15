// outsource dependencies
import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    resolve: {
        alias: {
            "@react-native/assets-registry/registry": resolve(
                __dirname,
                "src/mocks/assets-registry.ts",
            ),
        },
    },
});
