import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { useColorScheme } from "react-native";
import { ThemeProvider, type Surface } from "@olympusoss/canvas";

// The docs' theme controls. Canvas's ThemeProvider is driven by `scheme` and
// `surface`; this holds that state and exposes setters to the topbar toggles, so the
// docs are themed by the very kit they document. (Density is a web-only DOM switch in
// the original docs and has no effect on the native components, so it is omitted here.)
type Scheme = "light" | "dark";

interface DocsThemeContext {
  scheme: Scheme;
  surface: Surface;
  toggleScheme: () => void;
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
  const [scheme, setScheme] = useState<Scheme>(system === "dark" ? "dark" : "light");
  const [surface, setSurface] = useState<Surface>("default");

  const value = useMemo<DocsThemeContext>(
    () => ({
      scheme,
      surface,
      toggleScheme: () => setScheme((s) => (s === "dark" ? "light" : "dark")),
      setSurface,
    }),
    [scheme, surface],
  );

  return (
    <Ctx.Provider value={value}>
      <ThemeProvider scheme={scheme} surface={surface}>
        {children}
      </ThemeProvider>
    </Ctx.Provider>
  );
}
