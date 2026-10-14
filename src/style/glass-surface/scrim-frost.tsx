// The modal scrim's blur on the web (the owner's GS-6 decision): Dark Factory's overlay scrim
// blurs the page it dims by 2 px (`WEB_FROST.scrimBlur`, judged against the `df-frost`
// card), so under glass a browser's scrim lays that blur under its tinted dim. Solid mode,
// Reduce Transparency, Increase Contrast and a browser without a backdrop filter keep the
// plain dim: wherever the functional layer's material resolves solid, nothing here samples
// the backdrop. The native scrims do not change: iOS and Android resolve their own files
// (scrim-frost.ios.tsx, scrim-frost.android.tsx), which render nothing and read no hook.
//
// A backdrop filter makes its element a backdrop root, and a frost inside one samples only
// what is inside it: a scrim that holds its modal's card (Dialog, AlertDialog) takes the
// blur on a layer of its own beneath the card (`ScrimFrost`), never on itself, while a
// scrim that is the card's sibling (Drawer, ActionSheet, the anchored phone sheet) wears
// it (`useScrimFrost`). test/scrim-frost.test.tsx holds both.

import { Platform, View, type StyleProp, type ViewStyle } from "react-native";
import { useMaterialResolution } from "./use-material-theme.js";
import { WEB_FROST } from "./web-frost.js";
import { materialFill } from "./glass-surface.shared.js";

const BLUR = `blur(${WEB_FROST.scrimBlur}px)`;
const FROST = { backdropFilter: BLUR, WebkitBackdropFilter: BLUR } as ViewStyle;

/**
 * The style that blurs what a modal scrim dims, for the scrim's own style array: Dark
 * Factory's 2 px backdrop blur under glass on the web, and null wherever the functional
 * layer's material resolves solid (solid mode, Reduce Transparency, Increase Contrast, a
 * browser without a backdrop filter) and on every other platform, so a solid scrim's markup
 * is unchanged.
 */
export function useScrimFrost(): ViewStyle | null {
  const { material } = useMaterialResolution({ layer: "functional" });
  return Platform.OS === "web" && material.renderer !== "solid" && WEB_FROST.scrimBlur > 0 ? FROST : null;
}

/**
 * The scrim's blur as a layer of its own, for a scrim that holds its modal's card: the
 * scrim's first child, filling it with the scrim's corners (`shape`), pointer-transparent
 * and hidden from assistive technology, so the card's own frost still samples the page.
 * Renders nothing wherever `useScrimFrost` returns null.
 */
export function ScrimFrost({ shape }: { shape?: StyleProp<ViewStyle> }) {
  const frost = useScrimFrost();
  return frost ? <View accessible={false} aria-hidden importantForAccessibility="no-hide-descendants" style={[materialFill(shape), frost]} /> : null;
}
