import { darkGlass, lightGlass, type ColorScheme, type GlassTokens } from "../tokens.js";

// The glass tints iOS paints, one per density layer and scheme, one set for every palette (the
// native tints are per scheme: CLAUDE.md, design language item 6). This table is the only place
// iOS's own numbers live: a tuning-harness tunable (.tuning-harness.json), judged on
// /testing/materials and the shipped pages, its runs logged in tools/native/liquid-motion.md.
//
// `IOS_GLASS` is what the ThemeProvider publishes as `theme.glass` on iOS (glass-tints.ios.ts):
// the fill the iOS frost paints over its blur, the fill iOS 26's Liquid Glass carries, and the
// tints every legibility solve composites (`legibleWash`, `legibleInnerFill`, `inverseDenseTint`).
// Under the v4 hand-off it is the public native set (`glassByScheme`) in both schemes: the old
// dark control override (white 0.05, the owner's GS-8 decision) existed because the native set's
// dark puck was a LIGHT tint (white 0.12) that read #373740 under the frost; the v4 dark puck is
// the hand-off's own raised surface (#1e1e29 at 0.72), which reads as the hand-off's control on
// any dark pane, so the override has nothing left to correct. test/ios-tints.test.ts holds it.
export const IOS_GLASS: Record<ColorScheme, GlassTokens> = {
  light: lightGlass,
  dark: darkGlass,
};
