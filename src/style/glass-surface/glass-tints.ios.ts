import { type ColorScheme, type GlassTokens, type Palette } from "../tokens.js";
import { IOS_GLASS } from "./ios-tints.js";

// The glass material's tints on iOS, under Liquid Glass and the iOS frost, one per
// density layer, for the active scheme. The ThemeProvider publishes them as
// `theme.glass`; each platform resolves its own file (glass-tints.ts, .ios.ts,
// .android.ts), so a web material change never moves a native one. iOS's are its own
// table (ios-tints.ts: the public `glassByScheme` but for the dark control puck, the
// owner's GS-8 decision), one set per scheme whatever the palette (CLAUDE.md, design
// language item 6).
export function glassTintsFor(scheme: ColorScheme, _palette?: Palette): GlassTokens {
  return IOS_GLASS[scheme];
}
