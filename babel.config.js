module.exports = {
    presets: ["module:@react-native/babel-preset"],
    // zod 4 ESM uses "export * as ns" syntax which Metro's Hermes transformer doesn't handle natively
    plugins: ["@babel/plugin-transform-export-namespace-from"],
};
