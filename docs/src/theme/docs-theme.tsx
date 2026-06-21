import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider, liquidGlassAvailable, type Surface } from "@olympusoss/canvas";

// The docs' theme controls. Canvas's ThemeProvider is driven by `scheme` and
// `surface`; this holds that state and exposes setters to the topbar toggles, so the
// docs are themed by the very kit they document. (Density is a web-only DOM switch in
// the original docs and has no effect on the native components, so it is omitted here.)
type Scheme = "light" | "dark";

interface DocsThemeContext {
  scheme: Scheme;
  surface: Surface;
  toggleScheme: () => void;
  setScheme: (s: Scheme) => void;
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
  // The scheme FOLLOWS the live OS appearance; only an explicit override wins. On native
  // (iOS/Android) there is no theme toggle, so `override` stays null and the app tracks
  // the OS light/dark setting in real time — the system chrome, including the iOS 26
  // Liquid Glass tab bar, follows along. The web topbar sun/moon sets the override.
  const [override, setOverride] = useState<Scheme | null>(null);
  const scheme: Scheme = override ?? systemScheme;
  // Start at the platform default: glass on iOS 26 (matching the OS), solid elsewhere.
  // The topbar Frost toggle (shown only where glass is opt-in) flips it from there.
  const [surface, setSurface] = useState<Surface>(liquidGlassAvailable() ? "glass" : "solid");

  const value = useMemo<DocsThemeContext>(
    () => ({
      scheme,
      surface,
      toggleScheme: () => setOverride(scheme === "dark" ? "light" : "dark"),
      setScheme: setOverride,
      setSurface,
    }),
    [scheme, surface],
  );

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider scheme={scheme} surface={surface}>{children}</ThemeProvider>
    </Ctx.Provider>
  );
}
