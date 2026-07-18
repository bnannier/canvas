// GlassBlurTargetHost — Android. Mounts the sibling BlurTargetView that restores
// real frost blur under expo-blur 57+, whose Android API blurs an explicitly
// referenced target instead of whatever renders behind the BlurView. The one safe
// shape (an ancestor target render-node-cycles libhwui into a RenderThread
// SIGSEGV; see GlassBlurTargetContext in glass-surface.shared) is a target the
// blurring surface does NOT sit inside, and <OverlayProvider>'s structure provides
// exactly that: its page content and its overlay outlet are native siblings. So
// the content side becomes the BlurTargetView and the outlet stays outside it:
//
//   <View box>                 — sizes/positions the provider in its parent, and
//     <BlurTargetView content>   anchors the outlet's absolute layer
//       {children}
//     </BlurTargetView>
//     {outlet}                 — portaled overlays; their frosts blur the sibling
//   </View>                      target above, never an ancestor
//
// With expo-blur absent, or pre-57 (no BlurTargetView export — there the legacy
// behind-the-view blur still works with no target at all), this renders the same
// single-View wrapper as the base file and reports the target unavailable.

import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import type * as ExpoBlurTypes from "expo-blur";
import { type GlassBlurTargetHostProps } from "./glass-surface.shared.js";

// expo-blur is an OPTIONAL peer: consumers without it must still build, so it is
// loaded with a guarded require (a literal id, so bundlers that DO have it
// installed still include it) instead of a static import (which fails module
// resolution for everyone who skipped the optional peer). Undefined when absent
// or in a pure-ESM runtime with no `require` — then the passthrough below.
declare const require: ((id: string) => unknown) | undefined;
let BlurTargetView: typeof ExpoBlurTypes.BlurTargetView | undefined;
try {
  if (typeof require === "function") {
    BlurTargetView = (require("expo-blur") as { BlurTargetView?: typeof ExpoBlurTypes.BlurTargetView }).BlurTargetView;
  }
} catch {
  BlurTargetView = undefined;
}

export const glassBlurTargetAvailable = BlurTargetView !== undefined;

// The style keys that arrange the provider's CHILDREN, as opposed to sizing or
// positioning the wrapper box itself. Splitting the single wrapper in two must not
// change layout, so the outer box keeps every box-level key (how the provider sits
// in its parent, where the outlet's absolute layer anchors, the box's own fill and
// border) while the BlurTargetView slotted between wrapper and children takes
// these child-arrangement keys — a consumer style like the docs' `gap: 28` keeps
// spacing the same nodes it spaced in the single-View structure.
const CHILD_KEYS = new Set<string>([
  "flexDirection", "flexWrap", "justifyContent", "alignItems", "alignContent",
  "gap", "rowGap", "columnGap",
  "padding", "paddingTop", "paddingBottom", "paddingLeft", "paddingRight",
  "paddingStart", "paddingEnd", "paddingHorizontal", "paddingVertical",
  "direction",
]);

// The target fills the outer box exactly: grow into a flex-sized wrapper (an app
// root's flex: 1), size by content when the wrapper is content-sized (a docs page
// or stage). Longhands with an explicit "auto" basis — react-native-web rewrites
// the `flex` shorthand's basis to 0%, which collapses content-sized hosts, and the
// native side keeps the longhand form for parity.
const TARGET_FILL: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto" };

export function splitHostStyle(style: StyleProp<ViewStyle>): { box: ViewStyle; content: ViewStyle } {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const box: Record<string, unknown> = {};
  const content: Record<string, unknown> = { ...TARGET_FILL };
  for (const [key, value] of Object.entries(flat)) {
    if (value == null) continue;
    if (CHILD_KEYS.has(key)) content[key] = value;
    else box[key] = value;
  }
  return { box: box as ViewStyle, content: content as ViewStyle };
}

export function GlassBlurTargetHost({ style, targetRef, outlet, children }: GlassBlurTargetHostProps) {
  if (!BlurTargetView) {
    return (
      <View style={style}>
        {children}
        {outlet}
      </View>
    );
  }
  const { box, content } = splitHostStyle(style);
  return (
    <View style={box}>
      <BlurTargetView ref={targetRef} style={content}>
        {children}
      </BlurTargetView>
      {outlet}
    </View>
  );
}
