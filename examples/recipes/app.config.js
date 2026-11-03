module.exports = {
  expo: {
    name: "Canvas Recipes",
    slug: "canvas-recipes",
    version: "1.0.0",
    scheme: "canvas-recipes",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.nannier.canvas.recipes",
      supportsTablet: true,
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
    },
    android: { package: "com.nannier.canvas.recipes" },
    web: { bundler: "metro", output: "single" },
    // Only the public docs build is mounted below /recipes; local/native runs stay unchanged.
    experiments: { baseUrl: process.env.CANVAS_RECIPES_BASE_PATH ?? "" },
    plugins: ["expo-font", ["expo-build-properties", { ios: { enableSceneSupport: true } }]],
  },
};
