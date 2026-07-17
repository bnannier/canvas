// The theme runtime: a ThemeProvider that supplies the active color scheme and
// token map, and a useTheme hook components read to paint with scheme-aware
// colors. This is the one piece of shared state the raw-RN components depend on;
// everything else they style with plain RN objects built from these tokens.

import { type ReactNode, createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { colorsByScheme, glassByScheme, type ColorScheme, type ColorTokens } from "./tokens.js";
import { liquidGlassAvailable } from "./glass-surface/liquid-glass.js";
import { useReducedTransparency, useIncreasedContrast } from "./a11y-preferences.js";

// Surface treatment. "glass" makes the functional layer's fills translucent across
// every overlay/bar component (see glassByScheme); "solid" is opaque. It is a
// theming dimension, like the color scheme, not a per-component prop. When the
// ThemeProvider's `surface` prop is omitted the PLATFORM DEFAULT applies: glass on
// iOS 26+ (Apple makes Liquid Glass the system material for that layer), solid
// everywhere else.
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
  /** Force a color scheme. Omit to follow the OS appearance. */
  scheme?: ColorScheme;
  /**
   * Surface treatment. "glass" makes every functional-layer fill (popover, bars)
   * translucent; "solid" is opaque. This is the theming-level glass switch, no
   * per-component glass prop. Omit to use the platform default: glass on iOS 26+
   * (the native system material for that layer), solid elsewhere.
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

export function ThemeProvider({ scheme, surface, tokens, children }: ThemeProviderProps) {
  const system = useColorScheme();
  // Reading the accessibility preferences here (not deep in a leaf) is what makes
  // glass REACTIVE: when the user toggles Reduce Transparency / Increase Contrast,
  // the provider re-renders, so defaultSurface() is re-evaluated (on iOS 26 the
  // native liquidGlassAvailable() flips) and the token merge below re-runs.
  const reducedTransparency = useReducedTransparency();
  const increasedContrast = useIncreasedContrast();
  const active: ColorScheme = scheme ?? (system === "dark" ? "dark" : "light");
  const resolved: Surface = surface ?? defaultSurface();
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
