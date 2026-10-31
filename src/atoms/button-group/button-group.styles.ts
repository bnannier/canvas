import { primaryText } from "../../style/primary-text.js";
import { actionFill, actionInk } from "../../style/action.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, MONO_FONT, alpha, shadow, customShadow, shape, webShadow } from "../../style/index.js";
import { type AttachedParts, type ButtonGroupSkin, type Size } from "./button-group.shared.js";

// Co-located ButtonGroup skins, one per platform. The group is laid out per
// segment in JS (there are no `first:`/`last:` style variants, so the joined-
// corner and shared-border math is computed here). The BRAND survives on every
// platform (the `primary` token and the semantic tokens, never a platform
// default), and only the native SHAPE, sizing, structure, and press feedback
// change per OS:
//   iOS (UISegmentedControl): a gray CAPSULE container (muted fill, a 3px inset)
//     holding segments; the SELECTED segment is a raised white capsule (small
//     shadow) with NO visible dividers (iOS 13+ style); labels ~13pt. Press =
//     opacity dim.
//   Android (M3 SegmentedButton): the GROUP is a fully-rounded stadium (1dp
//     `border` outline); segments share 1dp borders (no gap); the SELECTED
//     segment is a tonal fill (alpha(primary, .12)) with a `primary-text` label and
//     a leading check; press = android_ripple.
//   Web: the v4 hand-off's segmented control (`K.def('button-group')`: a `secondary`
//     track with the `border` hairline, a 3px inset and a 2px gap on the control corner,
//     the selected segment a flat `card` thumb on the sm shadow, 500 labels in
//     foreground or muted) with its split and stepper kinds as the web Button's pills.

// --- shared size scales (brand type/sizing, identical across platforms) ------

// Height + horizontal padding per size, mirroring the docs segSize scale
// (h-8 px-3 / h-9 px-4 / h-10 px-5).
export const sizeContainer: Record<Size, ViewStyle> = {
  small: { height: 32, paddingHorizontal: 12 },
  default: { height: 36, paddingHorizontal: 16 },
  large: { height: 40, paddingHorizontal: 20 },
};

// Label type per size (text-xs for small, text-sm otherwise).
export const sizeLabel: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 14, lineHeight: 20 },
  large: { fontSize: 14, lineHeight: 20 },
};

// Height-only per size, for cells whose padding differs from sizeContainer
// (the split chevron and the stepper's chevron cells: h-8 / h-9 / h-10).
export const sizeHeight: Record<Size, number> = {
  small: 32,
  default: 36,
  large: 40,
};

// Chevron glyph px per size (small gets the tighter 14px arrow).
export const chevronSize: Record<Size, number> = {
  small: 14,
  default: 16,
  large: 16,
};

// --- shared layout fragments (color-free; identical across platforms) --------

// Row of a centered label inside a cell. Border width is supplied by the skin
// (iOS segments are borderless; Android/web are 1px). Press feedback is applied
// by the component's Pressable.
export const segmentBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
};

// The dimmed look applied to a disabled group/segment (opacity-50).
export const dim: ViewStyle = { opacity: 0.5 };

// The split control's outer row, anchoring the (absolute) dropdown. Every group
// is HUG: the shell appends `useHugStyle()` (src/style/sizing.ts) at the root, so
// no container here carries a static alignSelf (which would pin a Row child to the
// top of a centered Row).
export const splitContainer: ViewStyle = {
  position: "relative",
  flexDirection: "row",
  alignItems: "center",
};

// When the split dropdown is open, the container is lifted into its own stacking
// context above sibling content. react-native-web gives every positioned View an
// implicit stacking context, so the menu's own `zIndex` is scoped INSIDE the
// `relative` container and cannot rise above a later sibling. Raising the
// container's zIndex while open lifts the whole control — buttons and menu
// together — above everything painted after it.
export const splitContainerLifted: ViewStyle = { zIndex: 50 };

// A split-menu dropdown row: padded; each skin's pressed branch tints it in its own
// menu row's shape (Dropdown's rows: the control corner on the web, square natively).
export const splitMenuItem: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 8,
  paddingVertical: 6,
};

// The stepper's outer row.
export const stepperContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

// A plain row of detached peers separated by a gap (gap-2).
export const spacedContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
};

// The attached-segment row (no gap; segments share borders).
export const segmentedContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
};

// The `block` modifier, pure color-free layout that is identical on every
// platform (so it lives here once, not in the skins): the group row is FILL
// (`useSizing({ block })` in the shell), and each segment flexes to an equal
// share. RN's `flex: 1` sets flex-basis 0, so segments split evenly regardless
// of how long their labels are.
export const blockSegment: ViewStyle = { flex: 1 };

// Glass is a theme material, shared across skins. Native controls retain their
// platform feedback and glyphs; GlassSurface resolves the platform's material. Under glass
// every kind keeps its solid geometry (the owner's GP-1 decision): each cell and track hands
// the skin's own box to `paneStyle`, which turns a resting border into padding and drops the
// fill, and the group's material (`GroupGlass`) fills the track's or cell's whole footprint
// on its own corners. Only the paint changes: the selected segment's puck is a separate
// material (`GlassSelection`), so a segment's own fill and shadow give way to it.
export const glassCorners: ViewStyle = { borderRadius: 9999 };
export const glassSelectionPosition: ViewStyle = { position: "absolute", pointerEvents: "none" };
export const glassSelectionShadow: ViewStyle = customShadow({ offsetY: 1, radius: 3, opacity: 0.12, elevation: 2 });
/**
 * A segment's surface under glass: its geometry (border widths, which `paneStyle` trades for
 * padding) without its paint, the fill and shadow the selection puck replaces.
 */
export function glassSurfaceGeometry(surface: ViewStyle): ViewStyle {
  const { backgroundColor: _fill, boxShadow: _box, shadowColor: _color, shadowOffset: _offset, shadowOpacity: _opacity, shadowRadius: _radius, elevation: _elevation, ...geometry } = surface;
  return geometry;
}
/** The label's colour under glass; its type and weight stay the skin's. */
export const glassSegmentColor = (t: ColorTokens, selected: boolean): TextStyle => ({
  color: selected ? primaryText(t) : t.foreground,
});
// The `attached` kind (Controls.dc.html `c-button-sizes`, its Left / Center / Right group):
// `display:inline-flex;border-radius:10px;border:1px solid var(--ln2);overflow:hidden;
// background:var(--sf3);box-shadow:inset 0 1px 0 var(--hl)` around cells of
// `height:40px;padding:0 14px;font:500 14px/1 var(--ft);color:var(--tx);border-right:1px
// solid var(--ln2)`, the selected one on `--sf4` and the others washing to it on hover. No
// platform ships the control, so every skin draws it on its own control corner. The box's
// edge is the `input` boundary every control takes (design-language item 1, the 3:1 floor
// where the hand-off's hairline is about 1.5:1); the rules between the cells are the
// hand-off's `field-border`, since the box's edge, not a rule, is the control's boundary.
export function attachedParts(corner: number): AttachedParts {
  const cell = { height: 40, paddingHorizontal: 14 };
  return {
    wrap: (t) => ({
      flexDirection: "row",
      alignItems: "stretch",
      borderRadius: corner,
      borderWidth: 1,
      borderColor: t.input,
      backgroundColor: t.secondary,
      overflow: "hidden",
      ...(t.highlight ? { boxShadow: `inset 0px 1px 0px ${t.highlight}` } : null),
    }),
    segment: (t, selected, leading) => ({
      ...(leading ? { borderStartWidth: 1, borderColor: t["field-border"] ?? t.border } : null),
      backgroundColor: selected ? t["surface-raised"] ?? t.secondary : "transparent",
    }),
    hover: (t) => ({ backgroundColor: t["surface-raised"] ?? t.secondary }),
    cell: { small: { height: 32, paddingHorizontal: 12 }, default: cell, large: { height: 48, paddingHorizontal: 18 } },
    type: { small: { fontSize: 13, lineHeight: 13, fontWeight: "500" }, default: { fontSize: 14, lineHeight: 14, fontWeight: "500" }, large: { fontSize: 16, lineHeight: 16, fontWeight: "500" } },
    label: (t) => ({ color: t.foreground }),
  };
}

// =============================================================================
// Web: the v4 hand-off's segmented control (`K.def('button-group')` in
// tools/v4/handoff/cv-kit-controls.js). The row sits in a track on the control corner
// (`secondary`, its --sf3, with the `border` hairline, its --ln, a 3px inset and a 2px
// gap); each segment rounds 3px inside the track's corner, the selected one a flat `card`
// thumb (its --sf) on the sm shadow, the labels 500 in `foreground` when selected and
// `muted-foreground` otherwise (its --tx and --tx2). The control is 30 / 36 / 44 tall at
// small / default / large, so a segment is 8px shorter: 22 / 28 / 36, padded 14 a side
// (8 for an icon alone), labels 12 at small and 13 otherwise. The split and stepper kinds
// and the spaced peers are the web Button's pills (29 / 36 / 40): the split is the call
// to action with its chevron half, the stepper and the spaced peers hairline pills.
// The compact density is the hand-off component page's platform switch (Component.dc.html
// line 153, the same track around `height:28px;padding:0 12px;border-radius:7px;
// font:500 12px/1 var(--ft)` buttons): a segment keeps its size's height and takes the
// small label on a 12 px inset.
// =============================================================================

// The filled Button's lit top edge (button.styles.ts FILLED_EDGE, `K.btn`'s `.28`).
const FILLED_EDGE = alpha("#ffffff", 0.28);

const SEGMENT_INSET = 3;
const SEGMENT_CORNER = shape.web.control - SEGMENT_INSET;
const PILL = shape.web.pill;
const WEB_SEGMENT: Record<Size, ViewStyle> = {
  small: { height: 22, paddingHorizontal: 14 },
  default: { height: 28, paddingHorizontal: 14 },
  large: { height: 36, paddingHorizontal: 14 },
};
const WEB_SEGMENT_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 12, lineHeight: 16 },
  default: { fontSize: 13, lineHeight: 18 },
  large: { fontSize: 13, lineHeight: 18 },
};
// The compact segment (Component.dc.html line 153): `padding:0 12px` and the small
// label on the hand-off's own 12 px line, `font:500 12px/1`, on its size's height (the
// line is the page's, where the small size's label sits on the renderer's 16).
const WEB_COMPACT_SEGMENT = { size: { paddingHorizontal: 12 } as ViewStyle, type: { fontSize: 12, lineHeight: 12 } as TextStyle };
// The Button's pill metrics (button.styles.ts), so a split or stepper lines up with a Button beside it.
const WEB_CELL: Record<Size, ViewStyle> = {
  small: { height: 29, paddingHorizontal: 14 },
  default: { height: 36, paddingHorizontal: 18 },
  large: { height: 40, paddingHorizontal: 22 },
};
const WEB_CELL_TYPE: Record<Size, TextStyle> = {
  small: { fontSize: 11.5, lineHeight: 15 },
  default: { fontSize: 12, lineHeight: 16 },
  large: { fontSize: 13, lineHeight: 18 },
};

export const webSkin: ButtonGroupSkin = {
  roundedSegmented: {
    wrap: { borderRadius: PILL, gap: 0 },
    cell: {
      small: { height: 24, paddingHorizontal: 12 },
      default: { height: 28, paddingHorizontal: 12 },
      large: { height: 36, paddingHorizontal: 12 },
    },
    // The navbar scheme thumb in Component.dc.html: .45 s with the spring's
    // cubic-bezier(.34,1.56,.64,1), on the same node in both scheme directions.
    thumb: (index, count, reduced) => ({
      width: `${100 / count}%`, height: "100%", borderRadius: PILL,
      transform: [{ translateX: `${index * 100}%` }],
      transitionProperty: "transform", transitionDuration: `${reduced ? 0 : 450}ms`,
      transitionTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
    } as ViewStyle),
  },
  segmentedWrap: (t) => ({
    ...segmentedContainer,
    padding: SEGMENT_INSET,
    gap: 2,
    borderRadius: shape.web.control,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.secondary,
  }),
  segmentBorderWidth: 0,
  joinCorners: () => ({ borderRadius: SEGMENT_CORNER }),
  spacedCorners: { borderRadius: PILL },
  overlap: null,
  segmentSurface(t, selected) {
    return selected
      ? { backgroundColor: t.card, boxShadow: webShadow("sm", t) }
      : { backgroundColor: "transparent" };
  },
  segmentLabel(t, selected) {
    return { fontWeight: "500", color: selected ? t.foreground : t["muted-foreground"] };
  },
  // Glyphs track the label: foreground on the selected thumb, muted otherwise.
  segmentIconColor: (selected) => (selected ? "foreground" : "muted"),
  segmentIconOnlyPadding: 8,
  compactSegment: WEB_COMPACT_SEGMENT,
  showSelectedCheck: false,
  segmentSize: WEB_SEGMENT,
  segmentType: WEB_SEGMENT_TYPE,
  cellSize: WEB_CELL,
  cellType: WEB_CELL_TYPE,
  // The segment glyph (`K.def`'s iconsOnly segments and the Controls card: 15 px).
  segmentIconSize: 15,
  attached: attachedParts(shape.web.control),
  // A spaced peer has no track behind it: it is the outline Button's hairline pill.
  spacedSurface: (t) => ({ borderWidth: 1, borderColor: t.border, backgroundColor: "transparent" }),
  spacedLabel: (t) => ({ fontWeight: "700", color: t.foreground }),

  // --- split: the call to action with its chevron half ---
  // `K.def('button-group')` builds the split from the default Button (`K.btn`, its 40 px
  // box, 16 px inset, 500 14/1 label and lit top edge on the control corner) joined to a
  // chevron half a segmented height square (`width:36px`, a 14 px chevron); the Controls
  // card leads the label with its 16 px icon, 8 apart.
  splitPrimary(t) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopStartRadius: shape.web.control,
      borderBottomStartRadius: shape.web.control,
      backgroundColor: actionFill(t),
      boxShadow: `inset 0px 1px 0px ${FILLED_EDGE}`,
    };
  },
  splitPrimaryLabel(t) {
    return { fontWeight: "500", color: actionInk(t) };
  },
  splitCell: {
    small: { height: 32, paddingHorizontal: 12 },
    default: { height: 40, paddingHorizontal: 16 },
    large: { height: 48, paddingHorizontal: 22 },
  },
  splitCellType: {
    small: { fontSize: 13, lineHeight: 13 },
    default: { fontSize: 14, lineHeight: 14 },
    large: { fontSize: 16, lineHeight: 16 },
  },
  splitTriggerWidth: { small: 30, default: 36, large: 44 },
  splitIconSize: { icon: 16, chevron: 14 },
  splitDivider(t, height) {
    return { width: 1, height, backgroundColor: alpha(actionInk(t), 0.2) };
  },
  splitTrigger(t, height) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopEndRadius: shape.web.control,
      borderBottomEndRadius: shape.web.control,
      backgroundColor: actionFill(t),
      boxShadow: `inset 0px 1px 0px ${FILLED_EDGE}`,
      paddingStart: 10,
      paddingEnd: 12,
      height,
    };
  },
  splitMenu(t) {
    return {
      position: "absolute",
      top: "100%",
      end: 0,
      zIndex: 50,
      marginTop: 4,
      minWidth: 180,
      borderRadius: shape.web.menu,
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: t.popover,
      padding: 8,
      ...shadow("lg", t),
    };
  },
  splitMenuItemPressed(t) {
    return { backgroundColor: t.accent, borderRadius: shape.web.control };
  },
  splitMenuText(t) {
    return { fontSize: 14, lineHeight: 20, color: t["popover-foreground"] };
  },

  // --- stepper: `K.def('button-group')`'s one box (`height:36px;border-radius:10px;
  // border:1px solid var(--ln2);background:var(--sf2)`) around square end cells holding a
  // 14 px minus and plus, the value `min-width:32px;font:500 14px var(--fm)` between them.
  // The box's edge is the `input` control boundary (design-language item 1). ---
  stepperArrow() {
    return { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "transparent" };
  },
  stepperArrowLeft: {},
  stepperArrowRight: {},
  stepperMiddle() {
    return { flexDirection: "row", alignItems: "center", justifyContent: "center", minWidth: 32 };
  },
  stepperLabel(t) {
    return { fontFamily: MONO_FONT, fontWeight: "500", color: t.foreground };
  },
  stepperChevronColor: "muted",
  stepperBox: {
    box: (t) => ({ alignItems: "stretch", borderRadius: shape.web.control, borderWidth: 1, borderColor: t.input, backgroundColor: t.popover, overflow: "hidden" }),
    height: { small: 30, default: 36, large: 44 },
  },
  stepperValueCell: {
    small: { paddingHorizontal: 0 },
    default: { paddingHorizontal: 0 },
    large: { paddingHorizontal: 0 },
  },
  stepperSigns: 14,

  pressedOpacity: 0.9,
};

// =============================================================================
// iOS (UISegmentedControl): gray rounded container, raised white selected pill.
// =============================================================================

const IOS_PILL_SHADOW: ViewStyle = customShadow({ offsetY: 1, radius: 2, opacity: 0.18, elevation: 2 });

export const iosSkin: ButtonGroupSkin = {
  // The gray CAPSULE track that holds the segments (radius 9999, muted fill, a
  // 3px inset so the selected pill floats inside). iOS 26+ (Liquid Glass) draws
  // the segmented control as a capsule, not a rounded rectangle.
  segmentedWrap(t) {
    return {
      flexDirection: "row",
      alignItems: "center",
      padding: 3,
      borderRadius: shape.ios.pill,
      backgroundColor: t.muted,
    };
  },
  segmentBorderWidth: 0, // iOS 13+ has no visible dividers/borders
  joinCorners() {
    // Every segment is an independent CAPSULE pill (radius 9999) inside the
    // track; the selected one floats as a raised white capsule.
    return { borderRadius: 9999 };
  },
  spacedCorners: { borderRadius: shape.ios.control },
  overlap: null, // no shared borders; the track's padding spaces them
  segmentSurface(t, selected) {
    return selected
      ? { ...IOS_PILL_SHADOW, backgroundColor: t.background }
      : { backgroundColor: "transparent" };
  },
  segmentLabel(t, selected) {
    // ~13pt SF label; selected reads slightly heavier. Both stay on-foreground
    // (the selected pill is white/elevated, not a brand fill).
    return { fontWeight: selected ? "600" : "500", color: t.foreground };
  },
  // Glyphs track the label: on-foreground on and off the white/elevated thumb.
  segmentIconColor: () => "foreground",
  showSelectedCheck: false,
  attached: attachedParts(shape.ios.control),

  // --- split (HIG: primary action + chevron, brand fill, capsule) ---
  // The split is two prominent iOS buttons joined by a hairline, so the outer
  // corners read as one capsule group (radius 9999), matching button.styles.ts
  // (iOS 27 prominent buttons are full pills) and this skin's segmented pills.
  splitPrimary(t) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopStartRadius: 9999,
      borderBottomStartRadius: 9999,
      backgroundColor: actionFill(t),
    };
  },
  splitPrimaryLabel(t) {
    return { fontWeight: "600", color: actionInk(t) };
  },
  splitDivider(t, height) {
    return { width: 1, height, backgroundColor: alpha(actionInk(t), 0.2) };
  },
  splitTrigger(t, height) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopEndRadius: 9999,
      borderBottomEndRadius: 9999,
      backgroundColor: actionFill(t),
      paddingHorizontal: 10,
      height,
    };
  },
  splitMenu(t) {
    return {
      position: "absolute",
      top: "100%",
      end: 0,
      zIndex: 50,
      marginTop: 6,
      minWidth: 200,
      borderRadius: shape.ios.menu,
      borderWidth: 0,
      borderColor: t.border,
      backgroundColor: t.popover,
      padding: 6,
      ...shadow("lg", t),
    };
  },
  splitMenuItemPressed(t) {
    return { backgroundColor: t.accent };
  },
  splitMenuText(t) {
    return { fontSize: 15, lineHeight: 20, color: t["popover-foreground"] };
  },

  // --- stepper (HIG: gray-tracked prev/current/next, capsule ends) ---
  stepperArrow(t, height) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0,
      backgroundColor: t.muted,
      paddingHorizontal: 10,
      height,
    };
  },
  stepperArrowLeft: { borderTopStartRadius: shape.ios.control, borderBottomStartRadius: shape.ios.control },
  stepperArrowRight: { marginStart: 1, borderTopEndRadius: shape.ios.control, borderBottomEndRadius: shape.ios.control },
  stepperMiddle(t) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 0,
      marginStart: 1,
      backgroundColor: t.muted,
    };
  },
  stepperLabel(t) {
    return { fontWeight: "600", color: t.foreground };
  },
  stepperChevronColor: "foreground",

  pressedOpacity: 0.8,
};

// =============================================================================
// Android (Material 3 SegmentedButton): stadium group, tonal selected fill.
// =============================================================================

export const androidSkin: ButtonGroupSkin = {
  // The group is a fully-rounded stadium outlined in 1dp `border`; the segments
  // sit inside and supply their own shared 1dp dividers.
  segmentedWrap(t) {
    return {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: shape.android.pill,
      borderWidth: 1,
      borderColor: t.border,
      overflow: "hidden",
    };
  },
  segmentBorderWidth: 0, // the wrap draws the outer outline; dividers are drawn below
  joinCorners() {
    // The stadium wrap clips the corners; segments themselves are square.
    return {};
  },
  // overflow:hidden clips the Material ripple to the rounded outline (spaced peers are pills).
  spacedCorners: { borderRadius: 9999, overflow: "hidden" },
  // Each segment after the first draws a 1dp leading divider in the outline color.
  overlap: null,
  segmentDivider: (t) => ({ borderStartWidth: 1, borderStartColor: t.border }),
  segmentSurface(t, selected) {
    // Selected = tonal fill (secondaryContainer ≈ alpha(primary, .12)).
    return selected ? { backgroundColor: alpha(t.primary, 0.12) } : { backgroundColor: "transparent" };
  },
  segmentLabel(t, selected) {
    // labelMedium; selected reads in the brand `primary-text` (onSecondaryContainer ≈ primary).
    return { fontWeight: "500", color: selected ? primaryText(t) : t.foreground };
  },
  // Glyphs track the label: the brand `primary` on the tonal selected fill.
  segmentIconColor: (selected) => (selected ? "primary" : "foreground"),
  showSelectedCheck: true,
  attached: attachedParts(shape.android.control),

  // --- split (M3: brand-filled primary + chevron, stadium) ---
  splitPrimary(t) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopStartRadius: 9999,
      borderBottomStartRadius: 9999,
      backgroundColor: actionFill(t),
      // clip the Material ripple to the rounded outline
      overflow: "hidden",
    };
  },
  splitPrimaryLabel(t) {
    return { fontWeight: "500", color: actionInk(t) };
  },
  splitDivider(t, height) {
    return { width: 1, height, backgroundColor: alpha(actionInk(t), 0.24) };
  },
  splitTrigger(t, height) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopEndRadius: 9999,
      borderBottomEndRadius: 9999,
      backgroundColor: actionFill(t),
      paddingHorizontal: 10,
      height,
      // clip the Material ripple to the rounded outline
      overflow: "hidden",
    };
  },
  splitMenu(t) {
    return {
      position: "absolute",
      top: "100%",
      end: 0,
      zIndex: 50,
      marginTop: 4,
      minWidth: 200,
      borderRadius: shape.android.menu,
      borderWidth: 0,
      borderColor: t.border,
      backgroundColor: t.popover,
      paddingVertical: 8,
      ...shadow("lg", t),
    };
  },
  splitMenuItemPressed(t) {
    return { backgroundColor: alpha(t.primary, 0.12) };
  },
  splitMenuText(t) {
    return { fontSize: 14, lineHeight: 20, color: t["popover-foreground"] };
  },

  // --- stepper (M3: outlined stadium prev/current/next) ---
  stepperArrow(t, height) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
      borderColor: t.border,
      backgroundColor: "transparent",
      paddingHorizontal: 10,
      height,
      // clip the Material ripple to the rounded stadium outline (the arrow cells are pill-cornered)
      overflow: "hidden",
    };
  },
  stepperArrowLeft: { borderTopStartRadius: 9999, borderBottomStartRadius: 9999 },
  stepperArrowRight: { marginStart: -1, borderTopEndRadius: 9999, borderBottomEndRadius: 9999 },
  stepperMiddle(t) {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      borderTopWidth: 1,
      borderBottomWidth: 1,
      marginStart: -1,
      borderColor: t.border,
      backgroundColor: "transparent",
    };
  },
  stepperLabel(t) {
    return { fontWeight: "500", color: t.foreground };
  },
  stepperChevronColor: "muted",

  pressedOpacity: null, // Android uses a ripple instead
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
