// Web + Android: there is no Apple Liquid Glass material, so it is never the
// platform default (glass stays opt-in, rendered as the expo-blur frost). iOS
// overrides this via liquid-glass.ios.ts.
/**
 * Whether Apple's Liquid Glass material is available: true on iOS 26 and later with Reduce
 * Transparency off, false on the web and Android. ThemeProvider's platform default surface
 * is glass exactly where it is true.
 */
export function liquidGlassAvailable(): boolean {
  return false;
}
