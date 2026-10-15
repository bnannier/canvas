import { darkGlass, lightGlass, type ColorScheme, type GlassTokens } from "../tokens.js";

// The glass tints iOS paints, one per density layer and scheme, one set for every palette (the
// native tints are per scheme: CLAUDE.md, design language item 6). This table is the only place
// iOS's own numbers live: a tuning-harness tunable (.tuning-harness.json), judged on
// /testing/materials and the shipped pages, its runs logged in tools/native/liquid-motion.md.
//
// `IOS_GLASS` is what the ThemeProvider publishes as `theme.glass` on iOS (glass-tints.ios.ts):
// the fill the iOS frost paints over its blur, the fill iOS 26's Liquid Glass carries, and the
// tints every legibility solve composites (`legibleWash`, `legibleInnerFill`, `inverseDenseTint`).
// It is the public native set (`glassByScheme`, which Android keeps unchanged) but for the dark
// control puck, white 0.05 where the native set says 0.12 (the owner's GS-8 decision): once the
// frost painted a field's tint over its blur (glass-surface-native-frost-self-sample-1), a dark
// text field's body read #373740 at 0.12 and the GS-2 cap left its addon no fill; at 0.05 the
// body reads #272730, as it did while the frost's veil darkened the tint, and the addon keeps a
// faint fill (measured on the iPhone 17 Pro simulator, iOS 27 runtime). The light scheme is
// the native set's. test/ios-tints.test.ts holds the table and what it leaves the dark field.
export const IOS_GLASS: Record<ColorScheme, GlassTokens> = {
  light: lightGlass,
  dark: { ...darkGlass, "glass-tint-control": "rgba(255, 255, 255, 0.05)" },
};
