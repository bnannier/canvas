import { useEffect } from "react";
import { Platform } from "react-native";
import { useTheme } from "@olympusoss/canvas";
import { alpha } from "./color";
import { TOPBAR_HEIGHT } from "../shell/topbar";

// Web-only. Native platforms have no persistent scrollbar to style, so there is no
// cross-platform primitive for this; the browser scrollbar is the one place the docs
// must reach the DOM. This writes a single <style> tag and rewrites it whenever the
// theme changes, so the scrollbar:
//   1. matches the active scheme + surface (a translucent muted-foreground thumb,
//      thinner under glass), and
//   2. clears the overlaying topbar — the main content column scrolls BEHIND the bar
//      (so the glass frost can refract live content), so its scrollbar track is inset
//      by the bar height instead of running up underneath it. Other scrollers (sidebar,
//      menus, code blocks) are themed but not inset, since nothing overlays them.
// Renders nothing and is a no-op off the web.
export function WebScrollbarTheme() {
  const { tokens, surface } = useTheme();
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const glass = surface === "glass";
    const thumb = alpha(tokens["muted-foreground"], glass ? 0.32 : 0.42);
    const thumbHover = alpha(tokens["muted-foreground"], glass ? 0.5 : 0.62);
    const css = `
*{ scrollbar-width: thin; scrollbar-color: ${thumb} transparent; }
::-webkit-scrollbar { width: 11px; height: 11px; background: transparent; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: ${thumb}; border-radius: 9999px; border: 3px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background: ${thumbHover}; background-clip: padding-box; }
::-webkit-scrollbar-corner { background: transparent; }
[data-scroll-main]::-webkit-scrollbar-track { margin-top: ${TOPBAR_HEIGHT}px; }
`;
    let el = document.getElementById("docs-scrollbar-theme") as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = "docs-scrollbar-theme";
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [tokens, surface]);
  return null;
}
