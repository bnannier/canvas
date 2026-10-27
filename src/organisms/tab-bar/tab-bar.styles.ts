import { alpha, shadow, type ColorTokens, type ViewStyle } from "../../style/index.js";
import { type TabBarSkin } from "./tab-bar.shared.js";

// Per-OS TabBar skins, the v4 hand-off's (its `tab-bar` renderer in
// tools/v4/handoff/cv-kit-inputs.js, which draws the web and iOS alike and Android apart).
// The bar's fill comes from `fill`, the labels' ink from `labelColor`, and the skin carries
// shape, label type, the active indicator and press feedback.

// The floating capsule (the web and iOS 26's floating tab bar): 62 tall, inset 6 around
// five cells 2 apart, fully round, on a 1px `field-border` rim (the hand-off's ln2) with the
// lg shadow. It floats 16 from the container's sides and 8 above its bottom edge (or reaches
// 12 into a safe-area inset, so on a device with a home indicator its bottom sits 22 up,
// clear of the indicator). The active destination is a capsule covering its whole cell in
// the accent's soft wash under the accent's text ink; the rest read `muted-foreground`;
// labels are 500 10 under the glyph, 2 below it. Under glass the bar is the
// functional-layer material (real Liquid Glass on iOS 26, the hand-off's frost on the web)
// and the active cell a static control-layer pane where it is. Solid paints the bar the
// opaque `card` the hand-off's glass fill tints. Press = dim.
const FLOATING_INSET = 6;
function floatingBar(t: ColorTokens): ViewStyle {
  return { borderWidth: 1, borderRadius: 9999, paddingTop: FLOATING_INSET, paddingHorizontal: FLOATING_INSET, minHeight: 62, ...shadow("lg", t) };
}
const FLOATING: NonNullable<TabBarSkin["floating"]> = { horizontal: 16, bottom: 8, clearance: 12 };

function floatingFill(t: ColorTokens): { backgroundColor: string; borderColor: string } {
  return { backgroundColor: t.card, borderColor: t["field-border"] ?? t.input };
}

const softOf = (t: ColorTokens): string => t["primary-soft"] ?? alpha(t.primary, 0.16);

function cellWash(t: ColorTokens): ViewStyle {
  return { borderRadius: 9999, backgroundColor: softOf(t) };
}

export const iosSkin: TabBarSkin = {
  bar: floatingBar,
  fill: floatingFill,
  floating: FLOATING,
  cellGap: 2,
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 2, paddingVertical: 6, borderRadius: 9999 },
  label: () => ({ fontSize: 10, lineHeight: 13, fontWeight: "500" }),
  ripple: null,
  pressedOpacity: 0.6,
  pill: cellWash,
  pillCovers: "cell",
};

// Web: the same capsule, the browser's own press dim.
export const webSkin: TabBarSkin = {
  ...iosSkin,
  label: () => ({ fontSize: 10, lineHeight: 13, fontWeight: "500" }),
  pressedOpacity: 0.7,
};

// Material 3 navigation bar: docked and full-bleed, 80 tall on the `popover` surface (the
// hand-off's sf2) under a 1px `border` top rule; each destination a 64x32 stadium indicator
// in the accent's soft wash behind its glyph, 4 above a 500 12 label, the active label in
// `foreground` and the rest in `muted-foreground`; brand ripple.
export const androidSkin: TabBarSkin = {
  bar: () => ({ borderTopWidth: 1, paddingTop: 12, minHeight: 80 }),
  fill: (t) => ({ backgroundColor: t.popover, borderColor: t.border }),
  item: { flex: 1, alignItems: "center", justifyContent: "center", gap: 4, paddingVertical: 0 },
  label: () => ({ fontSize: 12, lineHeight: 16, fontWeight: "500" }),
  labelColor: (t, active) => (active ? t.foreground : t["muted-foreground"]),
  ripple: (t: ColorTokens) => ({ color: alpha(t.primary, 0.12), borderless: true, radius: 36 }),
  pressedOpacity: null,
  // The active indicator: 64x32, fully rounded. It carries NO insets: an absolutely
  // positioned child with no left/top is placed by the parent's alignItems/justifyContent,
  // so the centering wrapper puts it dead-center behind the icon on native Android AND web
  // alike (percentage left/top + negative margins centered on RN Web but drifted on native).
  pill: (t: ColorTokens): ViewStyle => ({
    position: "absolute",
    width: 64,
    height: 32,
    borderRadius: 9999,
    backgroundColor: softOf(t),
  }),
};
