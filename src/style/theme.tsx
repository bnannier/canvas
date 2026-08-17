// The theme runtime: a ThemeProvider that supplies the active color scheme and
// token map, and a useTheme hook components read to paint with scheme-aware
// colors. This is the one piece of shared state the raw-RN components depend on;
// everything else they style with plain RN objects built from these tokens.

import { type ReactNode, createContext, useContext, useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { colorsByScheme, glassByScheme, type ColorScheme, type ColorTokens } from "./tokens.js";
import { liquidGlassAvailable } from "./glass-surface/liquid-glass.js";
import { useReducedTransparency, useIncreasedContrast } from "./a11y-preferences.js";

// Surface treatment. "glass" makes the functional layer's fills translucent across
// every overlay/bar component (see glassByScheme); "solid" is opaque. It is a
// theming dimension, like the color scheme, not a per-component prop. The
// ThemeProvider spells it as a boolean axis (`<ThemeProvider glass>` /
// `<ThemeProvider solid>`); when neither is passed the PLATFORM DEFAULT applies:
// glass on iOS 26+ (Apple makes Liquid Glass the system material for that layer),
// solid everywhere else. This value type remains the resolved form the theme
// carries, and the provider's legacy `surface` prop still accepts it.
export type Surface = "solid" | "glass";

/**
 * Brand token overrides for the ThemeProvider `tokens` prop. Two shapes:
 *
 * - A flat `Partial<ColorTokens>` applies the same overrides to BOTH schemes
 *   (the common rebrand: `tokens={{ primary: "#7c3aed" }}`).
 * - A `{ light, dark }` object overrides each scheme separately, for brands
 *   whose colors shift between appearances.
 *
 * The two shapes are unambiguous because `ColorTokens` has no `light`/`dark` key.
 */
export type ThemeTokenOverrides =
  | Partial<ColorTokens>
  | { light?: Partial<ColorTokens>; dark?: Partial<ColorTokens> };

// Resolve the overrides that apply to the active scheme: a { light, dark } shape
// contributes its per-scheme set; a flat Partial applies to both schemes as-is.
function overridesFor(tokens: ThemeTokenOverrides | undefined, scheme: ColorScheme): Partial<ColorTokens> | undefined {
  if (!tokens) return undefined;
  if ("light" in tokens || "dark" in tokens) {
    return (tokens as { light?: Partial<ColorTokens>; dark?: Partial<ColorTokens> })[scheme];
  }
  return tokens as Partial<ColorTokens>;
}

export interface ThemeValue {
  scheme: ColorScheme;
  surface: Surface;
  tokens: ColorTokens;
  dark: boolean;
  /** OS "Reduce Transparency" is on: GlassSurface renders opaque (Apple AX). */
  reducedTransparency: boolean;
  /** OS "Increase Contrast" is on: GlassSurface renders opaque + a contrasting border (Apple AX). */
  increasedContrast: boolean;
}

const ThemeContext = createContext<ThemeValue | null>(null);
const FALLBACK: ThemeValue = {
  scheme: "light",
  surface: "solid",
  tokens: colorsByScheme.light,
  dark: false,
  reducedTransparency: false,
  increasedContrast: false,
};

export interface ThemeProviderProps {
  // Scheme axis (pick one; omit both to follow the OS appearance). The color
  // scheme spelled like every other Canvas axis: the prop name is the value.
  // `dark` wins when both are passed.
  /** Force the dark color scheme. */
  dark?: boolean;
  /** Force the light color scheme. */
  light?: boolean;
  /**
   * Legacy value form of the scheme axis ("light" | "dark"), kept for
   * back-compat and for config-driven code that already holds a `ColorScheme`
   * value (a stored preference, an <html> hook). The boolean axis above wins
   * when both are passed.
   */
  scheme?: ColorScheme;
  /**
   * The scheme the SERVER rendered, for SSR/SSG apps (Next.js and the like)
   * whose client scheme can differ from it (a stored preference, the OS).
   * Canvas resolves colors in JS and serializes them into the server HTML as
   * literal inline styles, so when the hydration render disagrees with that
   * HTML, React logs a mismatch and keeps the server's colors on any element
   * that never re-renders again: components stay stuck in the server's scheme.
   * With `ssrScheme` set, the provider renders it on the server AND for the
   * hydration render (matching the server HTML exactly), then applies the
   * requested scheme (the boolean axis or the legacy `scheme` prop) right
   * after mount; that switch re-renders every consumer, which writes the
   * real colors to the DOM. Pass the same value the server resolves (e.g. the
   * next-themes `defaultTheme`). Omit in client-only apps and on native.
   */
  ssrScheme?: ColorScheme;
  // Surface axis (pick one; omit for the platform default: glass on iOS 26+, the
  // native system material for that layer, solid elsewhere). The theming-level
  // glass switch, spelled like every other Canvas axis; there is no per-component
  // glass prop. `glass` wins when both are passed.
  /** Force the translucent functional layer (popovers, bars) on. */
  glass?: boolean;
  /** Force the opaque functional layer, even on iOS 26+. */
  solid?: boolean;
  /**
   * Legacy value form of the surface axis ("solid" | "glass"), kept for
   * back-compat and for config-driven code that already holds a `Surface`
   * value. The boolean axis above wins when both are passed.
   */
  surface?: Surface;
  /**
   * Brand token overrides, merged over the active scheme's base tokens so a
   * consumer can rebrand the kit (e.g. `tokens={{ primary: "#7c3aed" }}`)
   * without forking the token files. Pass a flat `Partial<ColorTokens>` to
   * apply the same overrides to both schemes, or `{ light, dark }` to override
   * each scheme separately. The glass-surface overrides still compose on top
   * (base, then brand, then glass), so rebranding never disturbs the glass
   * material. Pass a stable reference (a module constant or a memoized object);
   * an inline literal re-creates the theme value on every render.
   */
  tokens?: ThemeTokenOverrides;
  children: ReactNode;
}

// The platform default surface. iOS 26 renders the functional layer (bars, overlays)
// as Liquid Glass by default, so a Canvas app matches the OS there; every other
// platform (web, Android, iOS < 26, Reduce Transparency) defaults to solid.
function defaultSurface(): Surface {
  return liquidGlassAvailable() ? "glass" : "solid";
}

export function ThemeProvider({ dark, light, scheme, ssrScheme, glass, solid, surface, tokens, children }: ThemeProviderProps) {
  const system = useColorScheme();
  // Reading the accessibility preferences here (not deep in a leaf) is what makes
  // glass REACTIVE: when the user toggles Reduce Transparency / Increase Contrast,
  // the provider re-renders, so defaultSurface() is re-evaluated (on iOS 26 the
  // native liquidGlassAvailable() flips) and the token merge below re-runs.
  const reducedTransparency = useReducedTransparency();
  const increasedContrast = useIncreasedContrast();
  // Until the post-mount effect runs, honor `ssrScheme` so the server output is
  // deterministic and the hydration render reproduces it exactly (see the prop
  // doc). When the prop is absent this stays on the single-pass path: no state
  // flip, no extra render.
  const [hydrated, setHydrated] = useState(ssrScheme == null);
  useEffect(() => {
    if (!hydrated) setHydrated(true);
  }, [hydrated]);
  // Axis first-match (dark over light), then the legacy value form, then the OS
  // appearance. Mirrors the surface axis below: the prop name is the value.
  const active: ColorScheme = hydrated
    ? (dark ? "dark" : light ? "light" : (scheme ?? (system === "dark" ? "dark" : "light")))
    : (ssrScheme as ColorScheme);
  // Axis first-match (glass over solid), then the legacy value form, then the
  // platform default. Mirrors every component axis: the prop name is the value.
  const resolved: Surface = glass ? "glass" : solid ? "solid" : (surface ?? defaultSurface());
  const value = useMemo<ThemeValue>(() => {
    // Merge order: scheme base, then brand overrides, then the glass material
    // overrides; glass stays on top so a rebrand composes with it unchanged.
    const brand = overridesFor(tokens, active);
    const base = brand ? { ...colorsByScheme[active], ...brand } : colorsByScheme[active];
    // Apply the translucent glass fill only when glass is active AND no
    // accessibility setting demands an opaque surface. Under Reduce Transparency or
    // Increase Contrast the `popover` token snaps back to its solid (brand-aware)
    // value for EVERY glass consumer at once, including the module-absent
    // PlainSurface fallback (Apple AX1/AX2).
    const glass = resolved === "glass" && !reducedTransparency && !increasedContrast;
    return {
      scheme: active,
      surface: resolved,
      tokens: glass ? { ...base, ...glassByScheme[active] } : base,
      dark: active === "dark",
      reducedTransparency,
      increasedContrast,
    };
  }, [active, resolved, tokens, reducedTransparency, increasedContrast]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext) ?? FALLBACK;
}
