// Config plugin for the component audit's native build only (docs/app.config.js under
// CANVAS_AUDIT_BUILD=1). The in-app driver speaks plain HTTP to the capture host on the
// loopback address (http://127.0.0.1:8791: the Mac itself from the iOS simulator, the
// host through `adb reverse` from the Android emulator), and a Release build refuses
// cleartext by default on both platforms.
//
// Android: `usesCleartextTraffic` on the application. A network security config scoped
// to 127.0.0.1 would be narrower, but Android ignores `usesCleartextTraffic` whenever a
// config is present, which would also cut a Debug build of this app (`--dev`) off from
// Metro at 10.0.2.2; the app is a local capture rig whose only peers are on loopback.
// iOS: App Transport Security's `NSAllowsLocalNetworking`, which admits loopback and
// local names and nothing else. Neither change reaches the docs app the store ships.
const { AndroidConfig, withAndroidManifest, withInfoPlist } = require("expo/config-plugins");

function withCleartextLoopback(config) {
  config = withAndroidManifest(config, (mod) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(mod.modResults);
    application.$["android:usesCleartextTraffic"] = "true";
    return mod;
  });
  config = withInfoPlist(config, (mod) => {
    const transport = mod.modResults.NSAppTransportSecurity ?? {};
    mod.modResults.NSAppTransportSecurity = { ...transport, NSAllowsLocalNetworking: true };
    return mod;
  });
  return config;
}

module.exports = withCleartextLoopback;
