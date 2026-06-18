// The theme runtime: a ThemeProvider that supplies the active color scheme and
// token map, and a useTheme hook components read to paint with scheme-aware
// colors. This is the one piece of shared state the raw-RN components depend on;
// everything else they style with plain RN objects built from these tokens.

import { type ReactNode, createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { colorsByScheme, glassByScheme, type ColorScheme, type ColorTokens } from "./tokens.js";
import { liquidGlassAvailable } from "./glass-surface/liquid-glass.js";

// Surface treatment. "glass" makes the functional layer's fills translucent across
// every overlay/bar component (see glassByScheme); "solid" is opaque. It is a
// theming dimension, like the color scheme, not a per-component prop. When the
// ThemeProvider's `surface` prop is omitted the PLATFORM DEFAULT applies: glass on
// iOS 26+ (Apple makes Liquid Glass the system material for that layer), solid
// everywhere else.
export type Surface = "solid" | "glass";

export interface ThemeValue {
  scheme: ColorScheme;
  surface: Surface;
  tokens: ColorTokens;
  dark: boolean;
}

const ThemeContext = createContext<ThemeValue | null>(null);
const FALLBACK: ThemeValue = { scheme: "light", surface: "solid", tokens: colorsByScheme.light, dark: false };

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
  children: ReactNode;
}

// The platform default surface. iOS 26 renders the functional layer (bars, overlays)
// as Liquid Glass by default, so a Canvas app matches the OS there; every other
// platform (web, Android, iOS < 26, Reduce Transparency) defaults to solid.
function defaultSurface(): Surface {
  return liquidGlassAvailable() ? "glass" : "solid";
}

export function ThemeProvider({ scheme, surface, children }: ThemeProviderProps) {
  const system = useColorScheme();
  const active: ColorScheme = scheme ?? (system === "dark" ? "dark" : "light");
  const resolved: Surface = surface ?? defaultSurface();
  const value = useMemo<ThemeValue>(
    () => ({
      scheme: active,
      surface: resolved,
      tokens: resolved === "glass"
        ? { ...colorsByScheme[active], ...glassByScheme[active] }
        : colorsByScheme[active],
      dark: active === "dark",
    }),
    [active, resolved],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext) ?? FALLBACK;
}
