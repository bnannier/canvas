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

// Whether THIS host instance mounts a BlurTargetView, given the wrapper style it
// will render with. Only a flex-sized host (an app root's flex: 1 — a box the
// viewport already bounds) can hold one: inside ScrollView content, Fabric's
// content measurement clamps a BlurTargetView to the viewport no matter its flex
// longhands, capping the page's scroll range at ~one screen. Content-sized hosts
// (a docs page or stage) therefore keep the plain-View passthrough and publish no
// target, and their frosts fall back to the fill-only material.
export function blurTargetMountable(style: StyleProp<ViewStyle>): boolean {
  if (BlurTargetView === undefined) return false;
  const flat = (StyleSheet.flatten(style) ?? {}) as ViewStyle;
  const grow = flat.flexGrow ?? (typeof flat.flex === "number" && flat.flex > 0 ? flat.flex : 0);
  return typeof grow === "number" && grow > 0;
}

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

// The target sizes exactly like the outer box: grow into a flex-sized wrapper (an
// app root's flex: 1), size by content when the wrapper is content-sized (a docs
// page or stage). The content layer MIRRORS the consumer's flex longhands rather
// than forcing a fill: a hardcoded flexShrink 1 let Fabric's ScrollView content
// measurement shrink the BlurTargetView to the viewport, capping every docs
// page's scroll range at ~one screen on Android. Longhands with an explicit
// "auto" basis — react-native-web rewrites the `flex` shorthand's basis to 0%,
// which collapses content-sized hosts, and native keeps the longhand form for
// parity.
const TARGET_FILL: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "auto" };

export function splitHostStyle(style: StyleProp<ViewStyle>): { box: ViewStyle; content: ViewStyle } {
  const flat = (StyleSheet.flatten(style) ?? {}) as Record<string, unknown>;
  const box: Record<string, unknown> = {};
  const hasLonghands = flat.flexGrow != null || flat.flexShrink != null || flat.flexBasis != null;
  const content: Record<string, unknown> = hasLonghands
    ? {
        flexGrow: flat.flexGrow ?? 0,
        flexShrink: flat.flexShrink ?? 0,
        flexBasis: flat.flexBasis ?? "auto",
      }
    : { ...TARGET_FILL };
  for (const [key, value] of Object.entries(flat)) {
    if (value == null) continue;
    if (CHILD_KEYS.has(key)) content[key] = value;
    else box[key] = value;
  }
  return { box: box as ViewStyle, content: content as ViewStyle };
}

export function GlassBlurTargetHost({ style, targetRef, outlet, children }: GlassBlurTargetHostProps) {
  if (!BlurTargetView || !blurTargetMountable(style)) {
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
