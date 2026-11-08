import { primaryText } from "../../style/primary-text.js";
import { platformShape } from "../../style/platform-shape.js";
import { type ViewStyle, type TextStyle } from "react-native";
import { alpha, MONO_FONT, TOUCH_TARGET, type ColorTokens, type TouchTargetSkin } from "../../style/index.js";
import { pageRoles } from "../../style/type-scale.js";

// The Steps skin, the v4 hand-off's (its `steps` renderer in tools/v4/handoff/cv-kit-inputs.js).
// Neither iOS nor Material 3 ships a multi-step wizard indicator (PLATFORM-REFERENCES.md:
// the HIG stepper is the +/- control, M3 dropped steppers after Material 1), so every
// platform draws the same steps in its own face:
//   - a 28px marker, its number 600 12px mono: a completed step is the `primary` disc
//     around a 13px check in `primary-foreground`; the current step a 2px `primary` ring
//     around the accent's text ink, haloed 4px in the accent's soft wash; an upcoming step
//     a 1.5px `field-border` ring (the hand-off's ln2) around `subtle-foreground`;
//   - horizontal: each marker with its 500 13px label 10 to its side, joined to the next
//     by a 2px connector (at least 16 long, 6 from its neighbours) in `primary` once the
//     step it leaves is complete, `field-border` before;
//   - vertical: a 28px rail of markers joined by 2px connectors at least 22 tall, each
//     label 500 14px 14 beside its marker, 4 down and 18 above the next step;
//   - the labels read `foreground` up to the current step and `subtle-foreground` after; a
//     vertical step's title sits on the 18.2 line (the variant title's 1.3) over its 400
//     12 / 16.8 description in the third ink, the current step's in the accent's text ink,
//     and a step carrying `progress` draws a 6 px bar 8 under its text, its fill running
//     from the accent to the cyan series hue with the accent's glow (the Navigation card);
//   - segmented: equal columns 8 apart, each a 4 px bar (the accent once reached, glowing on
//     the current step, `surface-raised` ahead) over the 500 13 / 15.6 title and the 400
//     12 / 15.6 status, 10 apart, the status in the success ink once done, the accent's
//     text ink on the current step and the third ink ahead (the Navigation tab-bar card);
//   - progress: the caption 500 13px over a 6px `surface-raised` track whose `primary`
//     fill carries the accent's 12px glow, the count 400 12px mono in `subtle-foreground`.
// Only the press feedback and the touch target stay each platform's own: the web and iOS
// dim a pressed marker, Android ripples; the HIG's 44pt and Material's 48dp targets come
// from the skin.

export type State = "completed" | "current" | "upcoming";

// =============================================================================
// Shared layout fragments (color-free; identical across platforms).
// =============================================================================

// flex-1 (grow + shrink, zero basis) shared by connectors and the columns that
// fill the remaining row width.
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// The 28px marker; its ring width and fill come from the state.
export const circleBase: ViewStyle = {
  height: 28,
  width: 28,
  flexShrink: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
  // clip the Material ripple to the rounded outline (Android bounds the
  // android_ripple to the view rect otherwise, so it bleeds past the circle).
  overflow: "hidden",
};

// The number inside the marker: 600 12px mono.
export const glyphBase: TextStyle = { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "600" };

/** The completed marker's check glyph size. */
export const checkSize = 13;
// The Wizard's short sidebar list, without the long vertical rail connectors.
export const compactCircle: ViewStyle = { width: 22, height: 22, boxShadow: "none" };
// The compact workflow's mono step number is small meta text.
export const compactGlyph: TextStyle = { fontSize: 11, lineHeight: 14 };
export const compactList: ViewStyle = { gap: 6 };
export const compactRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10 };
export const compactLabel: TextStyle = { fontSize: 13, fontWeight: "500" };

// The vertical layout's label: 500 14px on the 18.2 line (the variant title's role, the
// Navigation card's `font:500 14px/1.3`).
export const labelBase: TextStyle = { ...pageRoles.variantTitle };

// The horizontal layout's label: 500 13px, one line beside its marker.
export const labelBaseXs: TextStyle = { fontSize: 13, lineHeight: 18, fontWeight: "500" };

// w-full
export const fullWidth: ViewStyle = { width: "100%" };

// The progress layout's header: the caption and the count, 8 above the track.
export const progressHeader: ViewStyle = {
  marginBottom: 8,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

// The row pairing the rail with the content column, 14 apart.
export const verticalRow: ViewStyle = { flexDirection: "row", gap: 14 };

// The left rail: the marker stacked over its connector.
export const verticalRail: ViewStyle = { alignItems: "center" };

// The vertical connector: 2 wide, filling the step's height, at least 22.
export const verticalConnector: ViewStyle = {
  width: 2,
  minHeight: 22,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
};

// The content column beside the marker: 4 down to sit on the marker's line.
export const verticalContent: ViewStyle = { paddingTop: 4 };

// The space under a content column that has a step after it.
export const verticalContentSpacing: ViewStyle = { paddingBottom: 18 };

// The text and the in-step progress bar of a vertical step, 8 apart.
export const verticalStack: ViewStyle = { gap: 8 };

// The in-step progress bar's track: 6 tall, a pill (the hand-off's 3 on a 6 bar), clipping its fill.
export const stepProgressTrack: ViewStyle = { height: 6, borderRadius: 9999, overflow: "hidden" };

// The in-step fill: the filled share of the track, rounded like it.
export const stepProgressFill: ViewStyle = { height: "100%", borderRadius: 9999, overflow: "hidden" };

// The segmented layout: equal columns 8 apart, 4 below the row above.
export const segmentedRow: ViewStyle = { flexDirection: "row", gap: 8, paddingTop: 4 };

// One segment: its bar over its title and status, 10 apart.
export const segmentColumn: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 0, gap: 10 };

// The segment's bar: 4 tall, a pill (the hand-off's 2 on a 4 bar).
export const segmentBar: ViewStyle = { height: 4, borderRadius: 9999 };

// The segment's title (500 13 / 15.6) and status (400 12 / 15.6).
export const segmentTitle: TextStyle = { fontSize: 13, lineHeight: 15.6, fontWeight: "500" };
export const segmentStatus: TextStyle = { fontSize: 12, lineHeight: 15.6, fontWeight: "400" };

// The outer row and each step item: centred on the markers.
export const horizontalRow: ViewStyle = { flexDirection: "row", alignItems: "center" };

// The marker and its label, side by side, 10 apart.
export const horizontalColumn: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 10 };

// The horizontal connector: 2 tall, at least 16 long, 6 from its neighbours.
export const horizontalConnector: ViewStyle = {
  marginHorizontal: 6,
  height: 2,
  minWidth: 16,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
};

// =============================================================================
// The skin contract: only the colored, platform-varying parts.
// =============================================================================

export interface StepsSkin extends TouchTargetSkin {
  /** Fill, ring and halo of the marker for a given step state. */
  circleState: (t: ColorTokens, state: State) => ViewStyle;
  /** Color of the glyph (check / number) inside the marker. */
  glyphState: (t: ColorTokens, state: State) => TextStyle;
  /** Color of the step label for a given state. */
  labelState: (t: ColorTokens, state: State) => TextStyle;
  /** Background of a connector; `done` fills it primary. */
  connector: (t: ColorTokens, done: boolean) => ViewStyle;
  /** Caption left of the count in the progress layout. */
  progressCaption: (t: ColorTokens) => TextStyle;
  /** The percentage label in the progress layout. */
  progressPercent: (t: ColorTokens) => TextStyle;
  /** The progress track (unfilled). */
  progressTrack: (t: ColorTokens) => ViewStyle;
  /** The filled portion of the progress track (width set inline as %). */
  progressFill: (t: ColorTokens) => ViewStyle;
  /** The optional description line in the vertical layout, per state. */
  verticalDescription: (t: ColorTokens, state?: State) => TextStyle;
  /** A vertical step's in-step progress bar: its track fill, and its fill's gradient ends and glow. */
  stepProgressTrack: (t: ColorTokens) => ViewStyle;
  stepProgressFill: (t: ColorTokens) => { from: string; to: string; glow: ViewStyle };
  /** The segmented layout's bar, per state. */
  segmentBar: (t: ColorTokens, state: State) => ViewStyle;
  /** The segmented layout's status line ink, per state (the title takes `labelState`). */
  segmentStatus: (t: ColorTokens, state: State) => TextStyle;
  /** The `rows` layout: a row label's ink and weight, and the current row's fill. */
  rowLabel: (t: ColorTokens, state: State) => TextStyle;
  rowCurrent: (t: ColorTokens) => ViewStyle;
  /** iOS/web dim the marker on press; Android uses a ripple (null here). */
  pressedOpacity: number | null;
  /** Android ripple over a pressable marker; null on iOS/web. */
  ripple: ((t: ColorTokens, state: State) => { color: string; borderless: boolean }) | null;
}

const subtle = (t: ColorTokens): string => t["subtle-foreground"] ?? t["muted-foreground"];
const line = (t: ColorTokens): string => t["field-border"] ?? t.border;
const soft = (t: ColorTokens): string => t["primary-soft"] ?? alpha(t.primary, 0.16);

/** The hand-off's steps, every color and shape, without the press feedback or touch target. */
const look: Omit<StepsSkin, "minTarget" | "pressedOpacity" | "ripple"> = {
  circleState(t, state) {
    switch (state) {
      case "completed": return { borderWidth: 0, borderColor: "transparent", backgroundColor: t.primary };
      case "current": return { borderWidth: 2, borderColor: t.primary, backgroundColor: "transparent", boxShadow: `0px 0px 0px 4px ${soft(t)}` };
      case "upcoming": return { borderWidth: 1.5, borderColor: line(t), backgroundColor: "transparent" };
    }
  },
  glyphState(t, state) {
    switch (state) {
      case "completed": return { color: t["primary-foreground"] };
      case "current": return { color: primaryText(t) };
      case "upcoming": return { color: subtle(t) };
    }
  },
  labelState(t, state) {
    return { color: state === "upcoming" ? subtle(t) : t.foreground };
  },
  connector(t, done) {
    return { backgroundColor: done ? t.primary : line(t) };
  },
  // The Claude desktop sidebar (reference claude-desktop-chat): the current row filled a
  // step above the list, labels in the foreground ink, steps not yet reached muted.
  rowLabel(t, state) {
    return { color: state === "upcoming" ? t["muted-foreground"] : t.foreground, fontWeight: state === "current" ? "500" : "400" };
  },
  rowCurrent(t) {
    return { backgroundColor: t["surface-raised"] ?? t.muted };
  },
  progressCaption(t) {
    return { fontSize: 13, lineHeight: 18, fontWeight: "500", color: t.foreground };
  },
  progressPercent(t) {
    return { fontFamily: MONO_FONT, fontSize: 12, lineHeight: 16, fontWeight: "400", color: subtle(t) };
  },
  progressTrack(t) {
    return { height: 6, borderRadius: 9999, backgroundColor: t["surface-raised"] ?? t.secondary };
  },
  progressFill(t) {
    return { height: "100%", borderRadius: 9999, backgroundColor: t.primary, boxShadow: `0px 0px 12px ${t.glow ?? t.ring}` };
  },
  verticalDescription(t, state) {
    return { fontSize: 12, lineHeight: 16.8, fontWeight: "400", color: state === "current" ? primaryText(t) : subtle(t) };
  },
  stepProgressTrack(t) {
    return { backgroundColor: t["surface-raised"] ?? t.secondary };
  },
  // The accent into the cyan series hue (the hand-off's `linear-gradient(90deg, var(--ion),
  // var(--cyan))`), with the accent's 12 px glow.
  stepProgressFill(t) {
    return { from: t.primary, to: t["chart-2"], glow: { boxShadow: `0px 0px 12px ${t.glow ?? t.ring}` } };
  },
  segmentBar(t, state) {
    if (state === "upcoming") return { backgroundColor: t["surface-raised"] ?? t.secondary };
    return { backgroundColor: t.primary, ...(state === "current" ? { boxShadow: `0px 0px 12px ${t.glow ?? t.ring}` } : null) };
  },
  segmentStatus(t, state) {
    switch (state) {
      case "completed": return { color: t["success-text"] ?? t.success };
      case "current": return { color: primaryText(t) };
      case "upcoming": return { color: subtle(t) };
    }
  },
};

export const webSkin: StepsSkin = {
  ...look,
  minTarget: null,
  pressedOpacity: 0.9,
  ripple: null,
};

export const iosSkin: StepsSkin = {
  ...look,
  minTarget: TOUCH_TARGET.ios,
  // HIG press = opacity dim.
  pressedOpacity: 0.8,
  ripple: null,
};

export const androidSkin: StepsSkin = {
  ...look,
  minTarget: TOUCH_TARGET.android,
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};

/** The `rows` layout: 32 px rows 2 apart, labels 13 in from the row at the nav-row corner. */
export const rowList: ViewStyle = { gap: 2 };
export const row: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 32, paddingHorizontal: 13, borderRadius: platformShape.web.navRowCompact };
export const rowLabel: TextStyle = { flexShrink: 1, minWidth: 0, fontSize: 14, lineHeight: 20 };
