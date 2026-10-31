import { Platform } from "react-native";
import { View, useTheme } from "@nannier/canvas";
import { GRAIN, grainOpacity, pageColor } from "./page-look";

// The page behind the docs shell: the v4 hand-off's flat page, the scheme's `background`,
// fixed to the window, static and untouchable. Docs-only scaffolding; the value is
// ./page-look.ts's.
//
// The web shell mounts it behind everything (./navbar.tsx); a native screen mounts it inside
// its frame (./native-header.tsx), since the native tab and stack containers paint their own
// backgrounds under a screen. On the web it carries the backdrop marker the e2e paint check
// reads the page colour off, and the accent the kit's ThemeProvider resolved
// (`data-accent`, the `primary` token), since the flat page is the same in every palette
// and the check still has to tell a page opened in the wrong palette (e2e/support/docs.ts).
export function PageBackdrop() {
  const { tokens } = useTheme();
  return (
    <View
      {...(Platform.OS === "web" ? ({ dataSet: { pageBackdrop: "", accent: tokens.primary } } as object) : null)}
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, pointerEvents: "none", backgroundColor: pageColor(tokens) }}
    />
  );
}

// The rendered hand-off's grain is a constant gray film. Its design runtime rewrites
// feTurbulence attributes in the data URI, which makes the SVG paint uniform
// RGBA(187,187,187,128). Match those observed pixels rather than introducing the
// procedural noise that the unprocessed SVG would have produced. The same film
// covers web and native; its authored light/dark opacity remains unchanged.
export function PageGrain() {
  const { scheme } = useTheme();
  return (
    <View
      {...(Platform.OS === "web" ? ({ dataSet: { pageGrain: "" } } as object) : null)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: GRAIN.zIndex, pointerEvents: "none", opacity: grainOpacity(scheme), backgroundColor: GRAIN.renderedColor }}
    />
  );
}
