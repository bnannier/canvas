import { useEffect } from "react";
import { Platform } from "react-native";
import { useTheme } from "@nannier/canvas";
import { SCROLLBAR } from "../shell/page-look";

// The WebKit scrollbar's width on the web, the hand-off's 10 px (SCROLLBAR in
// ../shell/page-look.ts). The topbar is inset by this on the right so the bar sits in a
// gutter beside it instead of running underneath.
export const SCROLLBAR_W = SCROLLBAR.size;

// Web-only. Native platforms have no persistent scrollbar to style, so there is no
// cross-platform primitive for this; the browser scrollbar is the one place the docs
// must reach the DOM. This writes a single <style> tag and rewrites it when the scheme
// changes, with the hand-off's own rules and values (the `v4-page` card): `scrollbar-width:
// thin` in the thumb's wash over a transparent track, and for WebKit a 10 px bar whose
// thumb is a 10 px-radius pill inset by a 2 px transparent border, strengthening on hover.
// A scroller that hides its bar (a ScrollView with its indicator off, which is how
// react-native-web writes `scrollbar-width: none` as a class) keeps it hidden: the class
// outranks the `*` rule. Renders nothing and is a no-op off the web.
export function WebScrollbarTheme() {
  const { scheme } = useTheme();
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const thumb = SCROLLBAR.thumb[scheme];
    const thumbHover = SCROLLBAR.thumbHover[scheme];
    const css = `
*{ scrollbar-width: thin; scrollbar-color: ${thumb} transparent; }
::-webkit-scrollbar { width: ${SCROLLBAR.size}px; height: ${SCROLLBAR.size}px; }
::-webkit-scrollbar-track, ::-webkit-scrollbar-corner { background: transparent; }
::-webkit-scrollbar-thumb { background: ${thumb}; border-radius: ${SCROLLBAR.radius}px; border: ${SCROLLBAR.inset}px solid transparent; background-clip: padding-box; }
::-webkit-scrollbar-thumb:hover { background-color: ${thumbHover}; }
/* Inside a component preview stage, hide the persistent browser scrollbar a scrollable
   demo would otherwise show: iOS/Android use a transient indicator, not a fixed bar, so a
   visible bar reads as wrong in the iOS/Android preview columns. The demo still scrolls. */
[data-preview-stage] ::-webkit-scrollbar { display: none; }
[data-preview-stage], [data-preview-stage] * { scrollbar-width: none; }
`;
    let el = document.getElementById("docs-scrollbar-theme") as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = "docs-scrollbar-theme";
      document.head.appendChild(el);
    }
    el.textContent = css;
  }, [scheme]);
  return null;
}

// Web-only, like the scrollbar theme above. The narrow web shell floats its tab bar over
// the page and the topbar overlays it at every width, so a browser scrolling an element
// "into view" (a focused field, an anchored trigger, Playwright's own click actionability)
// would otherwise park it under that chrome. `scroll-padding` is the platform's way to
// tell a scroll container where its overlaid edges are: every page scroller declares
// its band, and native scrollIntoView aligns inside it. Native screens inset themselves
// through their own bars, so this renders nothing off the web.
//
// Focus is the one scroll that does not ask: Chromium moves focus "into view if needed"
// against the raw viewport, so a Tab that lands on a control under the floating tab bar
// leaves it hidden there (WCAG 2.4.11, focus not obscured). So a focus that lands inside a
// page scroller with its ring outside the padded band is scrolled to the band's nearest
// edge, which `scrollIntoView` measures with the scroll padding, and with a scroll margin of
// the ring's reach (its gap and band, drawn outside the control or the frame around it) so
// the ring clears the chrome too.
/** How far a focus ring reaches past what it surrounds: the kit's ring gap and band, and a frame's edge around a flush scroller. */
const FOCUS_REACH = 8;

export function WebScrollPadding({ top, bottom }: { top: number; bottom: number }) {
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    const onFocus = (event: FocusEvent) => {
      const target = event.target;
      if (!(target instanceof Element) || !target.closest("[data-page-scroll]")) return;
      const box = target.getBoundingClientRect();
      if (box.top - FOCUS_REACH < Math.ceil(top) || box.bottom + FOCUS_REACH > window.innerHeight - Math.ceil(bottom)) {
        target.scrollIntoView({ block: "nearest", inline: "nearest" });
      }
    };
    document.addEventListener("focusin", onFocus);
    return () => document.removeEventListener("focusin", onFocus);
  }, [top, bottom]);
  useEffect(() => {
    if (Platform.OS !== "web" || typeof document === "undefined") return;
    let el = document.getElementById("docs-scroll-padding") as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = "docs-scroll-padding";
      document.head.appendChild(el);
    }
    el.textContent = `[data-page-scroll] { scroll-padding-top: ${Math.ceil(top)}px; scroll-padding-bottom: ${Math.ceil(bottom)}px; } [data-page-scroll] :focus { scroll-margin: ${FOCUS_REACH}px; }`;
  }, [top, bottom]);
  return null;
}
