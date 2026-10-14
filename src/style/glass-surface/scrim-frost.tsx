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
// blur on a layer of its own beneath the card (`useHeldScrim`), never on itself, while a
// scrim that is the card's sibling (Drawer, ActionSheet, the anchored phone sheet) wears
// it (`useScrimFrost`). Either way the dim and the blur are one element, as Dark Factory's
// scrim is: its background paints over its own filtered backdrop, so the blur samples the
// page and never the dim (no material may sample itself). test/scrim-frost.test.tsx holds
// both.

import type { ReactElement } from "react";
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
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

/** The scrim's role node under glass on the web: its dim moves onto the frost layer. */
const HOLDER: ViewStyle = { backgroundColor: "transparent" };

/**
 * A scrim that holds its modal's card (Dialog, AlertDialog): the style for its role node and
 * the layer to render as that node's first child. Under glass on the web the layer carries
 * the scrim's dim as its own background over Dark Factory's 2 px backdrop blur, one element as
 * Dark Factory's scrim is, so the blur samples the page and never the dim, and the role node
 * paints no dim of its own; the layer fills the node with its corners, pointer-transparent
 * and hidden from assistive technology, beneath the card, whose own frost then samples the
 * dimmed page (the node itself never wears a backdrop filter, which would cut the card's frost
 * off from the page). Wherever `useScrimFrost` returns null (solid mode, Reduce Transparency,
 * Increase Contrast, a browser without a backdrop filter) the node keeps `backdrop` untouched
 * and there is no layer, so a solid scrim's markup is unchanged.
 *
 * A layer that only blurred, beneath a node that wore the dim, sampled that dim: invisible on a
 * full-window scrim, whose straight edges clamp, but a light fringe at a contained scrim's
 * rounded corners, where the blur pulled the undimmed page outside the curve into the dim
 * (glass-surface-scrim-self-sample-1).
 */
export function useHeldScrim(backdrop: StyleProp<ViewStyle>): { style: StyleProp<ViewStyle>; layer: ReactElement | null } {
  const frost = useScrimFrost();
  if (!frost) return { style: backdrop, layer: null };
  const dim = StyleSheet.flatten(backdrop)?.backgroundColor;
  return {
    style: [backdrop, HOLDER],
    layer: <View accessible={false} aria-hidden importantForAccessibility="no-hide-descendants" style={[materialFill(backdrop), { backgroundColor: dim }, frost]} />,
  };
}
