// WEB root layout — exact parity with the Vite docs. It loads the same stylesheets and
// fonts, syncs the <html> theme/surface into Canvas's ThemeProvider (so the live
// component previews follow the docs toggles), and renders the original Vite Shell
// (sidebar + topbar + <Outlet>, the Outlet shimmed to Expo Router's <Slot>).
import "@/fonts.css";
import "../web/canvas-compiled.css";
import "@/docs-chrome.css";
import "@/docs.css";

import { ThemeProvider } from "@olympusoss/canvas";
import { useDocsScheme, useDocsSurface } from "@/use-docs-scheme";
import { Shell } from "@/layout/shell";

export default function WebRootLayout() {
  const scheme = useDocsScheme();
  const surface = useDocsSurface();
  return (
    <ThemeProvider scheme={scheme} surface={surface}>
      <Shell />
    </ThemeProvider>
  );
}
