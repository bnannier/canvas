import { Platform } from "react-native";
import { Image, View, useTheme } from "@nannier/canvas";
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

// The hand-off's grain: one baked 180 px tile of desaturated fractal noise (decision S6,
// tools/v4/bake-grain.ts, the GRAIN table in ./page-look.ts), tiled over the whole window
// above everything at the scheme's low opacity, untouchable and silent to assistive tech.
// Docs-only scaffolding like the page under it. Mount it last in the window's root so it
// lies over the shell and its chrome (the hand-off's z-index 100).
const GRAIN_TILE = require("../../assets/images/grain.png");

export function PageGrain() {
  const { scheme } = useTheme();
  return (
    <View
      {...(Platform.OS === "web" ? ({ dataSet: { pageGrain: "" } } as object) : null)}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0, zIndex: GRAIN.zIndex, pointerEvents: "none", opacity: grainOpacity(scheme) }}
    >
      <Image repeat source={GRAIN_TILE} width="100%" height="100%" />
    </View>
  );
}
