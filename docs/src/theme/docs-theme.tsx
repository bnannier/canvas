import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, Platform, useColorScheme } from "react-native";
import { ThemeProvider, type Surface } from "@nannier/canvas";

// The docs' theme controls. Canvas's ThemeProvider is driven by `scheme` and
// `surface`; this holds that state and exposes setters to the toggles, so the
// docs are themed by the very kit they document. (Density is a web-only DOM switch in
// the original docs and has no effect on the native components, so it is omitted here.)
type Scheme = "light" | "dark";

interface DocsThemeContext {
  scheme: Scheme;
  surface: Surface;
  /** The explicit user override, or null when the app follows the OS appearance. */
  override: Scheme | null;
  toggleScheme: () => void;
  /** Set an explicit scheme, or pass null to follow the OS appearance again. */
  setScheme: (s: Scheme | null) => void;
  setSurface: (s: Surface) => void;
}

const Ctx = createContext<DocsThemeContext | null>(null);

export function useDocsTheme(): DocsThemeContext {
  const c = useContext(Ctx);
  if (!c) throw new Error("useDocsTheme must be used inside <DocsThemeProvider>");
  return c;
}

export function DocsThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const systemScheme: Scheme = system === "dark" ? "dark" : "light";
  // The docs DEFAULT to dark on every platform (the Canvas Universe is the brand
  // stage and reads best in deep space). The web topbar sun/moon and the native
  // Appearance controls (the iOS header menu rows, the Android overflow-sheet
  // footer) change it; choosing System restores live OS tracking.
  const [override, setOverride] = useState<Scheme | null>("dark");
  const scheme: Scheme = override ?? systemScheme;
  // Frost (glass) is the DEFAULT surface on every platform, not just iOS 26. The
  // Solid/Frost toggle (shown where glass is not the OS material) flips it.
  const [surface, setSurface] = useState<Surface>("glass");

  // Sync the native system chrome (the iOS Liquid Glass bars, Android's Material
  // bars) to the dark default once at startup, since the initial override is set
  // without going through setScheme.
  useEffect(() => {
    if (Platform.OS !== "web") Appearance.setColorScheme("dark");
  }, []);

  // On native the override also drives the SYSTEM appearance for this app via
  // Appearance.setColorScheme, so the real chrome (the iOS 26 Liquid Glass tab bar and
  // navigation bar, Android's Material bars) follows the in-app choice instead of
  // splitting from the JS theme; null hands control back to the OS setting.
  const setScheme = useCallback((s: Scheme | null) => {
    setOverride(s);
    if (Platform.OS !== "web") Appearance.setColorScheme(s ?? "unspecified");
  }, []);

  const value = useMemo<DocsThemeContext>(
    () => ({
      scheme,
      surface,
      override,
      toggleScheme: () => setScheme(scheme === "dark" ? "light" : "dark"),
      setScheme,
      setSurface,
    }),
    [scheme, surface, override, setScheme],
  );

  return (
    <Ctx.Provider value={value}>
      {/* The toggle state is a Surface value, so the axis booleans take
          expressions: both are explicit because the docs never want the
          platform default (the Frost/Solid toggle owns the choice). */}
      <ThemeProvider scheme={scheme} glass={surface === "glass"} solid={surface === "solid"}>{children}</ThemeProvider>
    </Ctx.Provider>
  );
}
