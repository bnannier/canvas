import { createContext, startTransition, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, Platform, useColorScheme } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import * as Linking from "expo-linking";
import { StatusBar } from "expo-status-bar";
import { ThemeProvider, type Surface } from "@nannier/canvas";
import { CANVAS_FONTS } from "../ui/fonts";
import { firstLook, launchRequest, subscribeThemeLinks } from "./theme-links";

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

// A link's `?scheme=light&surface=solid&palette=mint` is a fact only the browser knows,
// so the hydration render must reproduce the exported look (EXPORTED_LOOK in
// ./theme-links, dark glass in blush). Apply the browser's launch choice in a transition
// so a lazy component page can finish hydrating its Suspense boundary before the theme
// changes its material markup.

export function useDocsTheme(): DocsThemeContext {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDocsTheme must be used inside <DocsThemeProvider>");
  return c;
}

export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const systemScheme: Scheme = system === "dark" ? "dark" : "light";
  // Capture the launch request once. On native, Expo's synchronous launch URL
  // also covers the interval before the router publishes its first params.
  // Later in-app navigation keeps the user's manual appearance choices.
  const params = useGlobalSearchParams<{ scheme?: string; surface?: string; palette?: string }>();
  const [launch] = useState(() => {
    const url = Platform.OS === "web" ? null : Linking.getLinkingURL();
    const request = launchRequest(params, url);
    return { url, request, first: firstLook(Platform.OS, request) };
  });
  // The sun/moon button (the web Topbar, the narrow web drawer, the compact toggles in
  // the iOS and Android bars) changes the scheme, and the Solid/Glass control flips
  // the surface. The Blush/Mint control picks the palette, in the light scheme only:
  // the narrow web drawer's labelled toggles, the Android menu drawer's footer and the
  // Palette section of the iOS header menu (docs/src/shell/theme-toggles.tsx). Web
  // always starts in the exported look; native has no server markup to hydrate and
  // starts in the launch choice (firstLook).
  const [override, setOverride] = useState<Scheme | null>(launch.first.scheme);
  const scheme: Scheme = override ?? systemScheme;
  const [surface, setSurface] = useState<Surface>(launch.first.surface);
  // Held here, never through the kit's web `setPalette` helper: that one persists the
  // choice to localStorage, which the docs' privacy page rules out.
  const [palette, setPalette] = useState<Palette>(launch.first.palette);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const { request } = launch;
    startTransition(() => {
      if (request.scheme) setOverride(request.scheme);
      if (request.surface) setSurface(request.surface);
      if (request.palette) setPalette(request.palette);
    });
  }, [launch]);

  // Sync the native system chrome (the iOS Liquid Glass bars, Android's Material
  // bars) to the initial scheme once at startup, since the initial override is
  // set without going through setScheme.
  useEffect(() => {
    if (Platform.OS !== "web") Appearance.setColorScheme(launch.first.scheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- launch-time look, runs once
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
    return subscribeThemeLinks(Linking, launch.url, (next) => {
      if (next.scheme) setScheme(next.scheme);
      if (next.surface) setSurface(next.surface);
      if (next.palette) setPalette(next.palette);
    });
  }, [launch, setScheme]);

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
