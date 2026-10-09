import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, Platform, useColorScheme } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, type Surface } from "@nannier/canvas";
import { CANVAS_FONTS } from "../ui/fonts";
import { subscribeThemeLinks, themeFromParams, themeFromURL } from "./theme-links";

// The docs' theme controls. Canvas's ThemeProvider is driven by the dark/light,
// glass/solid and mint boolean axes; this holds that state and exposes setters to the
// toggles, so the docs are themed by the very kit they document. (Density is a web-only
// DOM switch in the original docs and has no effect on the native components, so it is
// omitted here.)
type Scheme = "light" | "dark";
// The kit's light palettes. Dark Factory has one dark palette, so the kit lets `dark`
// win over `mint`; the docs keep the palette choice through a dark spell regardless.
type Palette = "blush" | "mint";

interface DocsThemeContext {
  scheme: Scheme;
  surface: Surface;
  /** The light palette in force; the kit paints its one dark palette while the scheme is dark. */
  palette: Palette;
  /** The explicit user override, or null when the app follows the OS appearance. */
  override: Scheme | null;
  toggleScheme: () => void;
  /** Set an explicit scheme, or pass null to follow the OS appearance again. */
  setScheme: (s: Scheme | null) => void;
  setSurface: (s: Surface) => void;
  setPalette: (p: Palette) => void;
}

const Ctx = createContext<DocsThemeContext | null>(null);

// The appearance every pre-rendered page ships with (app.json `web.output: "static"`):
// the docs default to dark on every platform (the spectral currents and hero use
// the charcoal brand stage), to glass everywhere, not just iOS 26, and to blush, the
// kit's own light default, for when the scheme turns light.
const SERVER_SCHEME: Scheme = "dark";
const SERVER_SURFACE: Surface = "glass";
const SERVER_PALETTE: Palette = "blush";

// A link's `?scheme=light&surface=solid&palette=mint` is a fact only the browser knows,
// so the hydration render must reproduce the server's dark glass. Apply the browser's
// launch choice in a transition so a lazy component page can finish hydrating its
// Suspense boundary before the theme changes its material markup.

export function useDocsTheme(): DocsThemeContext {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDocsTheme must be used inside <DocsThemeProvider>");
  return c;
}

export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const systemScheme: Scheme = system === "dark" ? "dark" : "light";
  // Capture the launch parameters once. On native, Expo's synchronous launch URL
  // also covers the interval before the router publishes its first params.
  // Later in-app navigation keeps the user's manual appearance choices.
  const params = useGlobalSearchParams<{ scheme?: string; surface?: string; palette?: string }>();
  const [seed] = useState(() => {
    const url = Platform.OS === "web" ? null : Linking.getLinkingURL();
    return { ...themeFromParams(params), ...themeFromURL(url), url };
  });
  // The web topbar sun/moon and the native Appearance controls (the iOS header menu
  // rows, the Android overflow-sheet footer) change the scheme; choosing System
  // restores live OS tracking. The Solid/Glass toggle (shown where glass is not the
  // OS material) flips the surface, and the Blush/Mint control (the labelled form,
  // shown in the light scheme) picks the palette. Web always starts with the exported
  // appearance; native has no server markup to hydrate and uses the launch choice
  // immediately.
  const [override, setOverride] = useState<Scheme | null>(() =>
    Platform.OS === "web" ? SERVER_SCHEME : seed.scheme ?? SERVER_SCHEME,
  );
  const scheme: Scheme = override ?? systemScheme;
  const [surface, setSurface] = useState<Surface>(() =>
    Platform.OS === "web" ? SERVER_SURFACE : seed.surface ?? SERVER_SURFACE,
  );
  // Held here, never through the kit's web `setPalette` helper: that one persists the
  // choice to localStorage, which the docs' privacy page rules out.
  const [palette, setPalette] = useState<Palette>(() =>
    Platform.OS === "web" ? SERVER_PALETTE : seed.palette ?? SERVER_PALETTE,
  );

  useEffect(() => {
    if (Platform.OS !== "web") return;
    startTransition(() => {
      if (seed.scheme) setOverride(seed.scheme);
      if (seed.surface) setSurface(seed.surface);
      if (seed.palette) setPalette(seed.palette);
    });
  }, [seed]);

  // Sync the native system chrome (the iOS Liquid Glass bars, Android's Material
  // bars) to the initial scheme once at startup, since the initial override is
  // set without going through setScheme.
  useEffect(() => {
    if (Platform.OS !== "web") Appearance.setColorScheme(seed.scheme ?? SERVER_SCHEME);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- launch-time seed, runs once
  }, []);

  // On native the override also drives the SYSTEM appearance for this app via
  // Appearance.setColorScheme, so the real chrome (the iOS 26 Liquid Glass tab bar and
  // navigation bar, Android's Material bars) follows the in-app choice instead of
  // splitting from the JS theme; null hands control back to the OS setting.
  const setScheme = useCallback((s: Scheme | null) => {
    setOverride(s);
    if (Platform.OS !== "web") Appearance.setColorScheme(s ?? "unspecified");
  }, []);

  // Opening an external preview link is a new explicit appearance request,
  // including when the native app is already running. Missing axes preserve
  // their current choice. No router-param effect can reset ordinary navigation.
  useEffect(() => {
    if (Platform.OS === "web") return;
    return subscribeThemeLinks(Linking, seed.url, (next) => {
      if (next.scheme) setScheme(next.scheme);
      if (next.surface) setSurface(next.surface);
      if (next.palette) setPalette(next.palette);
    });
  }, [seed, setScheme]);

  const value = useMemo<DocsThemeContext>(
    () => ({
      scheme,
      surface,
      palette,
      override,
      toggleScheme: () => setScheme(scheme === "dark" ? "light" : "dark"),
      setScheme,
      setSurface,
      setPalette,
    }),
    [scheme, surface, palette, override, setScheme],
  );

  return (
    <Ctx.Provider value={value}>
      {/* The toggle state is a Surface value, so the axis booleans take
          expressions: both are explicit because the docs never want the
          platform default (the Glass/Solid toggle owns the choice). The palette
          axis names only mint, since blush is the kit's default; the kit itself
          lets dark win over it. */}
      {/* `fonts` hands the kit the Manrope faces the docs registered (docs/src/ui/fonts.ts). */}
      <ThemeProvider dark={scheme === "dark"} light={scheme === "light"} mint={palette === "mint"} glass={surface === "glass"} solid={surface === "solid"} fonts={CANVAS_FONTS}>
        {/* Expo config uses app-wide status-bar ownership on iOS. Its StatusBar
            wraps the RN managed stack on native and is a no-op on web. */}
        <StatusBar style={scheme === "dark" ? "light" : "dark"} />
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
}
