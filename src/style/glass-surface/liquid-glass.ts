// Web + Android: there is no Apple Liquid Glass material, so it is never the
// platform default (glass stays opt-in, rendered as the expo-blur frost). iOS
// overrides this via liquid-glass.ios.ts.
export function liquidGlassAvailable(): boolean {
  return false;
}
