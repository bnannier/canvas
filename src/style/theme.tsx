// The theme runtime: a ThemeProvider that supplies the active color scheme and
// token map, and a useTheme hook components read to paint with scheme-aware
// colors. This is the one piece of shared state the raw-RN components depend on;
// everything else they style with plain RN objects built from these tokens.

import { type ReactNode, createContext, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { colorsByScheme, glassByScheme, type ColorScheme, type ColorTokens } from "./tokens.js";

// Surface treatment. "glass" makes surface fills translucent across every
// component (see glassByScheme). It is a theming dimension, like the color
// scheme, not a per-component prop.
export type Surface = "default" | "glass";

export interface ThemeValue {
  scheme: ColorScheme;
  surface: Surface;
  tokens: ColorTokens;
  dark: boolean;
}

const ThemeContext = createContext<ThemeValue | null>(null);
const FALLBACK: ThemeValue = { scheme: "light", surface: "default", tokens: colorsByScheme.light, dark: false };

export interface ThemeProviderProps {
  /** Force a color scheme. Omit to follow the OS appearance. */
  scheme?: ColorScheme;
  /**
   * Surface treatment. "glass" makes every surface fill (card, popover)
   * translucent, so all surface components read as glass; "default" is solid.
   * This is the theming-level glass switch, no per-component glass prop.
   */
  surface?: Surface;
  children: ReactNode;
}

export function ThemeProvider({ scheme, surface = "default", children }: ThemeProviderProps) {
  const system = useColorScheme();
  const active: ColorScheme = scheme ?? (system === "dark" ? "dark" : "light");
  const value = useMemo<ThemeValue>(
    () => ({
      scheme: active,
      surface,
      tokens: surface === "glass"
        ? { ...colorsByScheme[active], ...glassByScheme[active] }
        : colorsByScheme[active],
      dark: active === "dark",
    }),
    [active, surface],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  return useContext(ThemeContext) ?? FALLBACK;
}
