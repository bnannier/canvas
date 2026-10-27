import type { ColorScheme, GlassTokens, Palette } from "../tokens.js";
import { WEB_TINTS } from "./web-frost.js";

// The glass material's tints on the web (and a platform without its own file), one per
// density layer, for the active scheme. The ThemeProvider publishes them as
// `theme.glass`; each platform resolves its own file (glass-tints.ts, .ios.ts,
// .android.ts), so a web material change never moves a native one. The web takes the
// hand-off's glass tints (web-frost.ts, the tuned table), one set per scheme whatever the
// accent palette.
export function glassTintsFor(scheme: ColorScheme, _palette?: Palette): GlassTokens {
  return WEB_TINTS[scheme];
}
