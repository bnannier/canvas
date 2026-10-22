module.exports = {
  expo: {
    name: "Canvas Starter",
    slug: "canvas-starter",
    version: "1.0.0",
    scheme: "canvas-starter",
    userInterfaceStyle: "automatic",
    ios: {
      bundleIdentifier: "com.nannier.canvas.starter",
      supportsTablet: true,
      infoPlist: { ITSAppUsesNonExemptEncryption: false },
    },
    android: {
      package: "com.nannier.canvas.starter",
    },
    web: { bundler: "metro", output: "single" },
    // Apps linked against the iOS 27 SDK must adopt the UIScene lifecycle or UIKit
    // traps at launch; Expo ships its scene delegate behind this build property.
    plugins: ["expo-router", "expo-font", ["expo-build-properties", { ios: { enableSceneSupport: true } }]],
    experiments: { typedRoutes: false },
  },
};
