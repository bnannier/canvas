import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, alpha } from "../../style/index.js";

// Co-located Steps skins, one per platform. Steps is a LIGHT treatment:
// the same multi-step progress STRUCTURE on every platform (numbered/check
// circles joined by connectors, plus the vertical and progress-bar layouts),
// with only small native touches per OS. The BRAND survives everywhere (the
// indigo `primary` token and the semantic tokens, never a platform default);
// only the indicator shape, the connector cap, the current-step emphasis, and
// the press feedback change per OS:
//   iOS (HIG): circular step indicators with ROUNDED connector caps; completed =
//     filled `primary`; current = a `primary` ring on a transparent fill (a
//     subtle inner ring via a 1.5px `ring`-token halo); press = opacity dim.
//   Android (M3): step indicators with FLAT (square-capped) connectors; completed
//     = filled `primary`; current = `primary` ring; press = android_ripple on
//     interactive step circles.
//   Web: the established Canvas look (lifted verbatim from the original file).
//
// The State axis (completed / current / upcoming) maps each colored part to a
// token set. Layout-only fragments are shared static objects (below); anything
// reading a color is a function of the active tokens.

export type State = "completed" | "current" | "upcoming";

// =============================================================================
// Shared layout fragments (color-free; identical across platforms).
// =============================================================================

// flex-1 (grow + shrink, zero basis) shared by connectors and the columns that
// fill the remaining row width.
export const flex1: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// h-8 w-8 shrink-0 flex-row items-center justify-center rounded-full border-2
export const circleBase: ViewStyle = {
  height: 32,
  width: 32,
  flexShrink: 0,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 9999,
  borderWidth: 2,
  // clip the Material ripple to the rounded outline (Android bounds the
  // android_ripple to the view rect otherwise, so it bleeds past the circle).
  overflow: "hidden",
};

// text-sm font-medium (the check / number inside the circle).
export const glyphBase: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };

// text-sm font-medium (vertical layout label).
export const labelBase: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };

// text-xs font-medium (horizontal layout label), colored by labelState.
export const labelBaseXs: TextStyle = { fontSize: 12, lineHeight: 16, fontWeight: "500" };

// w-full
export const fullWidth: ViewStyle = { width: "100%" };

// mb-1.5 flex-row items-center justify-between
export const progressHeader: ViewStyle = {
  marginBottom: 6,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
};

// flex-row gap-3 (the row pairing the rail with the content column).
export const verticalRow: ViewStyle = { flexDirection: "row", gap: 12 };

// items-center (the left rail: circle stacked over its connector).
export const verticalRail: ViewStyle = { alignItems: "center" };

// my-1 w-px flex-1 (the vertical connector) — color/cap come from the skin.
export const verticalConnector: ViewStyle = {
  marginVertical: 4,
  width: 1,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
};

// pb-6 (bottom inset on a content column that has a step after it).
export const verticalContentSpacing: ViewStyle = { paddingBottom: 24 };

// flex-row items-start (the outer row and each step item).
export const horizontalRow: ViewStyle = { flexDirection: "row", alignItems: "flex-start" };

// items-center gap-1.5 (the circle + label column).
export const horizontalColumn: ViewStyle = { alignItems: "center", gap: 6 };

// mx-2 mt-4 h-px flex-1 (the horizontal connector) — color/cap come from the skin.
export const horizontalConnector: ViewStyle = {
  marginHorizontal: 8,
  marginTop: 16,
  height: 1,
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
};

// =============================================================================
// The skin contract: only the colored, platform-varying parts.
// =============================================================================

export interface StepsSkin {
  /** Fill + border of the numbered/check circle for a given step state. */
  circleState: (t: ColorTokens, state: State) => ViewStyle;
  /** Color of the glyph (check / number) inside the circle. */
  glyphState: (t: ColorTokens, state: State) => TextStyle;
  /** Color of the step label for a given state (shared across platforms). */
  labelState: (t: ColorTokens, state: State) => TextStyle;
  /** Background + line cap of a connector; `done` fills it primary. */
  connector: (t: ColorTokens, done: boolean) => ViewStyle;
  /** Caption left of the percentage in the progress layout. */
  progressCaption: (t: ColorTokens) => TextStyle;
  /** The percentage label in the progress layout. */
  progressPercent: (t: ColorTokens) => TextStyle;
  /** The progress track (unfilled). */
  progressTrack: (t: ColorTokens) => ViewStyle;
  /** The filled portion of the progress track (width set inline as %). */
  progressFill: (t: ColorTokens) => ViewStyle;
  /** The optional description line in the vertical layout. */
  verticalDescription: (t: ColorTokens) => TextStyle;
  /** iOS/web dim the circle on press; Android uses a ripple (null here). */
  pressedOpacity: number | null;
  /** Android ripple over a pressable circle; null on iOS/web. */
  ripple: ((t: ColorTokens, state: State) => { color: string; borderless: boolean }) | null;
}

// --- shared brand mapping (label colors are identical across platforms) ------

// Upcoming steps drop to the muted foreground; completed/current stay foreground.
function labelState(t: ColorTokens, state: State): TextStyle {
  switch (state) {
    case "completed": return { color: t.foreground };
    case "current": return { color: t.foreground };
    case "upcoming": return { color: t["muted-foreground"] };
  }
}

// =============================================================================
// Web: the established Canvas look (lifted verbatim from the original file).
// =============================================================================

export const webSkin: StepsSkin = {
  // Completed fills primary; current is outlined in primary on a transparent fill;
  // upcoming sits on the muted token behind a border-toned ring.
  circleState(t, state) {
    switch (state) {
      case "completed": return { borderColor: t.primary, backgroundColor: t.primary };
      case "current": return { borderColor: t.primary, backgroundColor: "transparent" };
      case "upcoming": return { borderColor: t.border, backgroundColor: t.muted };
    }
  },
  glyphState(t, state) {
    switch (state) {
      case "completed": return { color: t["primary-foreground"] };
      case "current": return { color: t.primary };
      case "upcoming": return { color: t["muted-foreground"] };
    }
  },
  labelState,
  // A connector fills primary once the step it leads out of is completed, else it
  // tracks the border token. Square caps (web rules are plain rects).
  connector(t, done) {
    return { backgroundColor: done ? t.primary : t.border };
  },
  progressCaption(t) {
    return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: t.foreground };
  },
  progressPercent(t) {
    return { fontSize: 12, lineHeight: 16, color: t["muted-foreground"] };
  },
  progressTrack(t) {
    return { height: 6, overflow: "hidden", borderRadius: 9999, backgroundColor: t.muted };
  },
  progressFill(t) {
    return { height: "100%", borderRadius: 9999, backgroundColor: t.primary };
  },
  verticalDescription(t) {
    return { fontSize: 12, lineHeight: 16, color: t["muted-foreground"] };
  },
  pressedOpacity: 0.9,
  ripple: null,
};

// =============================================================================
// iOS (HIG): circular indicators, rounded connector caps, primary ring current.
// =============================================================================

export const iosSkin: StepsSkin = {
  circleState(t, state) {
    switch (state) {
      // Completed reads as a solid filled `primary` disc.
      case "completed": return { borderColor: t.primary, backgroundColor: t.primary };
      // Current = a clean `primary` ring on a transparent fill (no muted backing,
      // so it reads as an open ring the way iOS step dots do).
      case "current": return { borderColor: t.primary, backgroundColor: "transparent" };
      // Upcoming = a soft muted disc behind a border-toned ring.
      case "upcoming": return { borderColor: t.border, backgroundColor: t.muted };
    }
  },
  glyphState(t, state) {
    switch (state) {
      case "completed": return { color: t["primary-foreground"] };
      case "current": return { color: t.primary };
      case "upcoming": return { color: t["muted-foreground"] };
    }
  },
  labelState,
  // iOS connectors get rounded caps so the rule reads as a soft rounded line.
  connector(t, done) {
    return { backgroundColor: done ? t.primary : t.border, borderRadius: 9999 };
  },
  progressCaption(t) {
    return { fontSize: 13, lineHeight: 18, fontWeight: "600", color: t.foreground };
  },
  progressPercent(t) {
    return { fontSize: 13, lineHeight: 18, color: t["muted-foreground"] };
  },
  progressTrack(t) {
    return { height: 6, overflow: "hidden", borderRadius: 9999, backgroundColor: t.muted };
  },
  progressFill(t) {
    return { height: "100%", borderRadius: 9999, backgroundColor: t.primary };
  },
  verticalDescription(t) {
    return { fontSize: 13, lineHeight: 18, color: t["muted-foreground"] };
  },
  // HIG press = opacity dim.
  pressedOpacity: 0.8,
  ripple: null,
};

// =============================================================================
// Android (M3): flat connector caps, filled-primary complete, primary ring current.
// =============================================================================

export const androidSkin: StepsSkin = {
  circleState(t, state) {
    switch (state) {
      // Completed = filled primary.
      case "completed": return { borderColor: t.primary, backgroundColor: t.primary };
      // Current = a primary ring; M3 keeps a faint tonal backing so the active
      // indicator reads against the surface (secondaryContainer ≈ alpha(primary,.12)).
      case "current": return { borderColor: t.primary, backgroundColor: alpha(t.primary, 0.12) };
      // Upcoming = a muted disc behind a border-toned ring.
      case "upcoming": return { borderColor: t.border, backgroundColor: t.muted };
    }
  },
  glyphState(t, state) {
    switch (state) {
      case "completed": return { color: t["primary-foreground"] };
      case "current": return { color: t.primary };
      case "upcoming": return { color: t["muted-foreground"] };
    }
  },
  labelState,
  // M3 connectors are flat (square caps) — explicit radius 0 so the rule reads
  // as a crisp Material divider, not a rounded line.
  connector(t, done) {
    return { backgroundColor: done ? t.primary : t.border, borderRadius: 0 };
  },
  progressCaption(t) {
    return { fontSize: 12, lineHeight: 16, fontWeight: "500", color: t.foreground };
  },
  progressPercent(t) {
    return { fontSize: 12, lineHeight: 16, color: t["muted-foreground"] };
  },
  progressTrack(t) {
    return { height: 4, overflow: "hidden", borderRadius: 9999, backgroundColor: t.muted };
  },
  progressFill(t) {
    return { height: "100%", borderRadius: 9999, backgroundColor: t.primary };
  },
  verticalDescription(t) {
    return { fontSize: 12, lineHeight: 16, color: t["muted-foreground"] };
  },
  // M3 press = android_ripple over the interactive circle.
  pressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
