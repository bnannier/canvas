import { PALETTES, colorsFor, type ColorScheme, type ColorTokens, type GlassTokens, type Palette } from "../../src/style/tokens.ts";
import { glassTintsFor } from "../../src/style/glass-surface/glass-tints.ts";
import { glassTintsFor as iosGlassTintsFor } from "../../src/style/glass-surface/glass-tints.ios.ts";
import { glassTintsFor as androidGlassTintsFor } from "../../src/style/glass-surface/glass-tints.android.ts";
import { paletteDeclarations } from "../../tools/tokens/css-tokens.ts";

// The looks the kit ships: every accent palette (violet, the default, then cyan, mint, rose
// and amber) in both schemes, since a v4 palette applies in both. The token-level
// legibility gates iterate these, so a palette the kit adds is held to every rule at once
// instead of to the ones someone remembered to extend. The default palette's looks are
// named for their scheme alone ("light", "dark"); the others carry the palette's name.

export interface Look {
  /** The name a test title uses. */
  name: string;
  scheme: ColorScheme;
  palette: Palette;
  tokens: ColorTokens;
  /** The web frost's tints under glass (web-frost.ts, through the web tint resolver). */
  webGlass: GlassTokens;
  /** iOS's glass tints (its Liquid Glass and frost, through the iOS tint resolver): one per scheme. */
  iosGlass: GlassTokens;
  /** Android's glass tints (its capture and expo-blur frosts, through the Android resolver): one per scheme. */
  androidGlass: GlassTokens;
}

function look(scheme: ColorScheme, palette: Palette): Look {
  const name = palette === "violet" ? scheme : `${palette} ${scheme}`;
  return { name, scheme, palette, tokens: colorsFor(palette, scheme), webGlass: glassTintsFor(scheme, palette), iosGlass: iosGlassTintsFor(scheme, palette), androidGlass: androidGlassTintsFor(scheme, palette) };
}

export const LOOKS: readonly Look[] = PALETTES.flatMap((palette) => (["light", "dark"] as const).map((scheme) => look(scheme, palette)));

/** The custom properties styles/tokens/colors.css resolves to for a look. */
export function lookDeclarations(css: string, l: Look): Record<string, string> {
  return paletteDeclarations(css, l.palette, l.scheme);
}

/** A look's tints on every platform, each named for the platform that paints it. */
export function glassSets(l: Look): readonly (readonly ["web" | "ios" | "android", GlassTokens])[] {
  return [["web", l.webGlass], ["ios", l.iosGlass], ["android", l.androidGlass]];
}

/** The ThemeProvider props that render a look. */
export function lookProps(l: Look): { scheme: ColorScheme } & Partial<Record<Palette, boolean>> {
  return { scheme: l.scheme, [l.palette]: true };
}
