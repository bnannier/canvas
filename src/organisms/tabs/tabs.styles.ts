import { primaryText } from "../../style/primary-text.js";
import { type TextStyle, type ViewStyle } from "react-native";
import { type ColorTokens, MONO_FONT, shadow, alpha, composite, customShadow, shape } from "../../style/index.js";
import { platformShape } from "../../style/platform-shape.js";
import { webHover } from "../../style/hover.js";
import { type TabsSkin } from "./tabs.shared.js";

// Co-located Tabs skins, one per platform, the v4 hand-off's (its `tabs` renderer in
// tools/v4/handoff/cv-kit-inputs.js and the `K.PF` ios and android rows, `P.tabs` in
// cv-kit-platform.js).
// The shell resolves the look axis (underline / pills / vertical), the selection, block and
// disabled state, and the badges; the skin supplies the shape, sizing, inks, fills,
// indicator and press feedback, all from the theme's tokens.
//
//   Web (the renderer): underline is a row of 40px tabs 24 apart on a 1px `border` rule,
//     500 14px labels in `muted-foreground` (`foreground` when active or hovered), the
//     active tab marked by a 2px `primary` bar over the rule with the accent's 12px glow;
//     pills is a `secondary` track at the tile corner, inset 4 with a 4 gap, of 34px
//     pills at the v4 nav row's corner, 500 13px, the active one a `card` thumb on the sm
//     shadow; vertical is a 200px rail of the same 34px rows, the active one the accent's
//     soft wash under the accent's text ink. The count badge is an 18px `surface-raised`
//     pill around 500 11px mono numerals.
//   iOS (UISegmentedControl, the HIG's control for switching closely related subviews):
//     underline and pills are both the capsule segmented control, a `secondary` capsule
//     inset 3 holding capsule segments 7 / 14 around a 13pt label (600 selected, 500 at
//     rest) in `foreground`, the selected one a raised thumb (white in light, the track
//     lifted 28% toward the ink in dark) on a 0 1 2 shadow at 18%; vertical is a 220pt
//     grouped rail of rows 2 apart at the iOS nav row's corner, 9 / 12 around a 15pt
//     label (600 selected, 400 at rest) in `foreground`, the selected row the `secondary`
//     wash. The badge is a 1 / 7 `surface-raised` pill, 600 12pt in `muted-foreground`.
//     Press dims (0.8); disabled dims to 0.5.
//   Android (Material 3 tabs): the underline row on the `border` divider, 12 / 16 tabs, 500
//     14sp labels in `primary-text` when active and `muted-foreground` at rest, the 3dp
//     `primary` indicator rounded on top; pills and vertical are stadiums in the accent's
//     soft wash when active. The badge is a 1 / 7 `surface-raised` pill, 500 12sp in
//     `muted-foreground`.

export type Variant = "underline" | "pills" | "vertical";

// --- shared layout fragments (color-free; identical across platforms) --------

// flex-1: an equal-flex trigger in block mode (shares the row width).
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The dimmed disabled look the shell applies per trigger, at the skin's own opacity.
export const disabledDim = (opacity: number): ViewStyle => ({ opacity });

// The selection tint lives with the other glass selections (Navbar, Sidebar, TabBar)
// in src/style/selection-tint.ts; re-exported here so the Tabs tests and skins keep
// their import.
export { selectionTint } from "../../style/selection-tint.js";

export const clearSelectionShadow: ViewStyle = shadow("none");

// w-full vs self-start: in block mode the row fills the available width so
// equal-flex triggers stretch it; otherwise the row hugs its triggers.
export function blockWidth(block: boolean): ViewStyle {
  return block ? { width: "100%" } : { alignSelf: "flex-start" };
}

// The horizontal overflow scroller around a non-block underline/pills row: hugs
// the row like `blockWidth(false)` (alignSelf flex-start), caps at the container
// (maxWidth 100%) so a long row pans instead of clipping, and zeroes ScrollView's
// default flexGrow:1 so the scroller never claims spare space in a flex parent.
export const overflowScroller: ViewStyle = {
  flexGrow: 0,
  flexShrink: 1,
  alignSelf: "flex-start",
  maxWidth: "100%",
};

// The wrapping (`wrap`) non-block row: the scroller's hug-and-cap contract on the
// tablist itself (hugs the triggers while they fit, caps at the container, shrinks
// beside Row siblings), with the overflow laid out on further lines instead of
// panned. No flexGrow reset: a View never claims spare space on its own.
export const wrapRow: ViewStyle = {
  flexWrap: "wrap",
  flexShrink: 1,
  alignSelf: "flex-start",
  maxWidth: "100%",
};

// --- the count badges ---------------------------------------------------------

// The accent's soft wash (the hand-off's ion-soft); every palette defines it.
const softOf = (t: ColorTokens): string => t["primary-soft"] ?? alpha(t.primary, 0.16);

const raised = (t: ColorTokens): string => t["surface-raised"] ?? t.secondary;

// The web badge: an 18px pill (min 18 wide, 5 inset) around 500 11px mono numerals.
const webBadgeBox = (t: ColorTokens): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  alignSelf: "center",
  height: 18,
  minWidth: 18,
  borderRadius: shape.web.pill,
  backgroundColor: raised(t),
  paddingHorizontal: 5,
});
const webBadgeLabel = (t: ColorTokens): TextStyle => ({ fontFamily: MONO_FONT, fontSize: 11, lineHeight: 18, fontWeight: "500", color: t.foreground });

// The native badge (iOS and Android): a 1 / 7 pill around 500 12 / 16 text in the muted
// ink; iOS sets it at 600.
const nativeBadgeBox = (t: ColorTokens): ViewStyle => ({
  flexDirection: "row",
  alignItems: "center",
  alignSelf: "center",
  borderRadius: 9999,
  backgroundColor: raised(t),
  paddingHorizontal: 7,
  paddingVertical: 1,
});
const nativeBadgeLabel = (t: ColorTokens): TextStyle => ({ fontSize: 12, lineHeight: 16, fontWeight: "500", color: t["muted-foreground"] });

// =============================================================================
// Web: the hand-off's renderer.
// =============================================================================

// The pills track's inset and gap, and its pills' height: the wrapped track keeps the
// track's own tile corner (it is no capsule), the gap opening between the lines.
const WEB_TRACK_INSET = 4;
const WEB_ROW_HEIGHT = 34;

// The vertical rail row's corner, the v4 nav row's.
const RAIL_ROW_CORNER: ViewStyle = { borderRadius: platformShape.web.navRow };

export const webSkin: TabsSkin = {
  pressedOpacity: 0.8,
  ripple: null,
  disabledOpacity: 0.4,
  railWidth: 200,
  railGap: 4,
  // The resting underline tab's label reads `foreground` under the pointer.
  hoverLabel: webHover((t: ColorTokens): TextStyle => ({ color: t.foreground })),

  // --- underline ---
  underlineRow(tokens) {
    return {
      flexDirection: "row",
      alignItems: "stretch",
      columnGap: 24,
      rowGap: 0,
      borderBottomWidth: 1,
      borderColor: tokens.border,
    };
  },
  underlineTrigger() {
    return { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 40 };
  },
  // The 2px accent bar over the rule (1 below the tab), rounded end to end, with the glow.
  underlineIndicator(tokens, selected) {
    return selected
      ? { position: "absolute", start: 0, end: 0, bottom: -1, height: 2, borderRadius: shape.web.pill, backgroundColor: tokens.primary, boxShadow: `0px 0px 12px ${tokens.glow ?? tokens.ring}` }
      : { display: "none" };
  },
  underlineLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? tokens.foreground : tokens["muted-foreground"] };
  },

  // --- pills ---
  pillsRow(tokens) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: WEB_TRACK_INSET,
      alignSelf: "flex-start",
      padding: WEB_TRACK_INSET,
      borderRadius: shape.web.tile,
      backgroundColor: tokens.secondary,
    };
  },
  pillsTrigger() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      height: WEB_ROW_HEIGHT,
      paddingHorizontal: 12,
      borderRadius: platformShape.web.navRow,
    };
  },
  pillsFill(tokens, selected) {
    return selected ? { ...shadow("sm", tokens), backgroundColor: tokens.card } : { backgroundColor: "transparent" };
  },
  pillsLabel(tokens, selected) {
    return { fontSize: 13, lineHeight: 18, fontWeight: "500", color: selected ? tokens.foreground : tokens["muted-foreground"] };
  },

  // --- vertical ---
  verticalTrigger() {
    return {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      height: WEB_ROW_HEIGHT,
      paddingHorizontal: 12,
      ...RAIL_ROW_CORNER,
    };
  },
  verticalFill(tokens, selected) {
    return { backgroundColor: selected ? softOf(tokens) : "transparent" };
  },
  verticalLabel(tokens, selected) {
    return { fontSize: 13, lineHeight: 18, fontWeight: "500", color: selected ? primaryText(tokens) : tokens["muted-foreground"] };
  },

  countBadgeBox: webBadgeBox,
  countBadgeLabel: webBadgeLabel,
};

// =============================================================================
// iOS: the capsule segmented control (UISegmentedControl), as the hand-off's `K.PF`
// ios row draws it; the vertical look is a grouped rail.
// =============================================================================

// The track's inset around its segments, and a segment's padding around its label line.
// A wrapped track is taller than one segment, so the capsule's 9999 would round its ends
// across the corner segments: it takes the corner concentric with them instead (a
// segment's half-height plus the inset), and the same inset opens between the lines.
const IOS_SEGMENT_INSET = 3;
const IOS_SEGMENT_PAD_Y = 7;
const IOS_SEGMENT_LABEL_LINE = 18;
const IOS_SEGMENT_WRAP_RADIUS = (IOS_SEGMENT_PAD_Y * 2 + IOS_SEGMENT_LABEL_LINE) / 2 + IOS_SEGMENT_INSET;

// The raised thumb's shadow: 0 1 2 at 18% black.
const IOS_THUMB_SHADOW: ViewStyle = customShadow({ offsetY: 1, radius: 2, opacity: 0.18, elevation: 2 });

/**
 * The selected segment's thumb, the hand-off's `--seg`: the white `card` in light, and in
 * dark the track lifted 28% toward the ink (#5a5a63 on the dark neutrals), so the thumb
 * reads lighter than the track in both schemes as Apple's segmented control does.
 */
function iosThumb(t: ColorTokens, dark: boolean): string {
  return dark ? composite(alpha(t.foreground, 0.28), t.secondary) : t.card;
}

function iosTrack(t: ColorTokens, wrap: boolean): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 0,
    rowGap: wrap ? IOS_SEGMENT_INSET : 0,
    alignSelf: "flex-start",
    padding: IOS_SEGMENT_INSET,
    borderRadius: wrap ? IOS_SEGMENT_WRAP_RADIUS : shape.ios.pill,
    borderCurve: "continuous",
    backgroundColor: t.secondary,
  };
}

const IOS_SEGMENT: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  borderRadius: shape.ios.pill,
  paddingHorizontal: 14,
  paddingVertical: IOS_SEGMENT_PAD_Y,
};

const iosThumbFill = (t: ColorTokens, selected: boolean, dark: boolean): ViewStyle =>
  selected ? { ...IOS_THUMB_SHADOW, backgroundColor: iosThumb(t, dark) } : { backgroundColor: "transparent" };

const iosSegmentLabel = (t: ColorTokens, selected: boolean): TextStyle => ({
  fontSize: 13,
  lineHeight: IOS_SEGMENT_LABEL_LINE,
  fontWeight: selected ? "600" : "500",
  color: t.foreground,
});

export const iosSkin: TabsSkin = {
  pressedOpacity: 0.8,
  ripple: null,
  disabledOpacity: 0.5,
  railWidth: 220,
  railGap: 2,
  hoverLabel: null,

  // --- underline: the segmented control (no rule, no indicator; the thumb marks the tab) ---
  underlineRow: iosTrack,
  underlineTrigger(tokens, selected, dark) {
    return { ...IOS_SEGMENT, ...iosThumbFill(tokens, selected, dark) };
  },
  underlineIndicator() {
    return { display: "none" };
  },
  underlineLabel: iosSegmentLabel,

  // --- pills: the same segmented control ---
  pillsRow: iosTrack,
  pillsTrigger() {
    return IOS_SEGMENT;
  },
  pillsFill: iosThumbFill,
  pillsLabel: iosSegmentLabel,

  // --- vertical: the grouped rail ---
  verticalTrigger() {
    return {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: platformShape.ios.navRow,
      borderCurve: "continuous",
      paddingHorizontal: 12,
      paddingVertical: 9,
    };
  },
  verticalFill(tokens, selected) {
    return { backgroundColor: selected ? tokens.secondary : "transparent" };
  },
  verticalLabel(tokens, selected) {
    return { fontSize: 15, lineHeight: 20, fontWeight: selected ? "600" : "400", color: tokens.foreground };
  },

  countBadgeBox: nativeBadgeBox,
  countBadgeLabel: (t) => ({ ...nativeBadgeLabel(t), fontWeight: "600" }),
};

// =============================================================================
// Android (Material 3): underline tabs. No container; each tab is text with a
// 3dp brand `primary` indicator bar under the active tab; inactive labels read
// muted; press = android_ripple.
// =============================================================================

// The M3 pills track's inset and gap, and its pill's height (7dp around the 20sp
// label line): the wrapped track's concentric corner, so a corner pill seats in it as in the one-line stadium.
// The 4dp gap already opens between the lines, so nothing else changes wrapped.
const M3_PILL_INSET = 4;
const M3_PILL_PAD_Y = 7;
const M3_PILL_LABEL_LINE = 20;
const M3_PILL_WRAP_RADIUS = (M3_PILL_PAD_Y * 2 + M3_PILL_LABEL_LINE) / 2 + M3_PILL_INSET;

export const androidSkin: TabsSkin = {
  pressedOpacity: null, // Android uses a ripple instead
  ripple: (tokens) => ({ color: alpha(tokens.primary, 0.12), borderless: false }),
  disabledOpacity: 0.38,
  railWidth: 220,
  railGap: 2,
  hoverLabel: null,

  // --- underline (M3 primary tabs) ---
  underlineRow(tokens) {
    // M3 tabs sit on a hairline divider; no track fill. Wrapped, the lines stack
    // on the one divider, each tab's own indicator marking the active one.
    return {
      flexDirection: "row",
      alignItems: "stretch",
      borderBottomWidth: 1,
      borderColor: tokens.border,
    };
  },
  underlineTrigger() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingVertical: 12,
    };
  },
  // M3 indicator: a 3dp brand `primary` bar under the active tab, its top corners
  // rounded at its own height.
  underlineIndicator(tokens, selected) {
    return {
      position: "absolute",
      bottom: 0,
      start: 0,
      end: 0,
      height: 3,
      borderTopStartRadius: platformShape.android.tabIndicator,
      borderTopEndRadius: platformShape.android.tabIndicator,
      backgroundColor: selected ? tokens.primary : "transparent",
    };
  },
  underlineLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? primaryText(tokens) : tokens["muted-foreground"] };
  },

  // --- pills (a `secondary` stadium track; the active pill the accent's soft wash) ---
  pillsRow(tokens, wrap) {
    return {
      flexDirection: "row",
      alignItems: "center",
      gap: M3_PILL_INSET,
      alignSelf: "flex-start",
      borderRadius: wrap ? M3_PILL_WRAP_RADIUS : shape.android.pill,
      backgroundColor: tokens.secondary,
      padding: M3_PILL_INSET,
    };
  },
  pillsTrigger() {
    return {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      borderRadius: shape.android.pill,
      // clip the Material ripple to the rounded (capsule) outline
      overflow: "hidden",
      paddingHorizontal: 14,
      paddingVertical: M3_PILL_PAD_Y,
    };
  },
  pillsFill(tokens, selected) {
    return { backgroundColor: selected ? softOf(tokens) : "transparent" };
  },
  pillsLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: M3_PILL_LABEL_LINE, fontWeight: "500", color: selected ? primaryText(tokens) : tokens["muted-foreground"] };
  },

  // --- vertical (a rail of stadium rows; the active one the accent's soft wash) ---
  verticalTrigger() {
    return {
      width: "100%",
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      borderRadius: shape.android.pill,
      // clip the Material ripple to the rounded outline
      overflow: "hidden",
      paddingHorizontal: 14,
      paddingVertical: 9,
    };
  },
  verticalFill(tokens, selected) {
    return { backgroundColor: selected ? softOf(tokens) : "transparent" };
  },
  verticalLabel(tokens, selected) {
    return { fontSize: 14, lineHeight: 20, fontWeight: "500", color: selected ? primaryText(tokens) : tokens["muted-foreground"] };
  },

  countBadgeBox: nativeBadgeBox,
  countBadgeLabel: nativeBadgeLabel,
};
