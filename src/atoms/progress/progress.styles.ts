import { alpha, tabularNums, type ColorTokens, type TextStyle, type ViewStyle } from "../../style/index.js";
import { MONO_FONT } from "../../style/mono.js";
import { type ProgressSkin, type Size } from "./progress.shared.js";

// Co-located Progress skins, one per platform, all driven by the brand tokens (passed in
// from useTheme so they follow light/dark). The fill is the accent (`primary`) on every
// platform, or the tone's solid color; only the native SHAPE of the bar (track thickness
// and the inactive-track tone) and the header's type change per OS, as the Canvas v4
// hand-off draws them (`K.def('progress')` in tools/v4/handoff/cv-kit-overlays.js and its
// `K.PF` rows in cv-kit-platform.js). The bar is a capsule on every platform:
//
//   iOS (UIProgressView / SwiftUI ProgressView): a THIN 4pt track (3 / 6 small / large)
//     on a NEUTRAL gray system fill, the subtle ink at 25%, never a tint of the progress
//     color; indeterminate is the activity indicator (progress.ios.tsx). The header is
//     500 14 / 20 with the percent at 400 in the muted ink.
//   Android (Material 3 linear progress indicator): a 4dp track (3 / 8), the inactive
//     track on the raised surface, a 4dp GAP between the active indicator and the track,
//     and the 4x4dp stop indicator dot (rendered by the shell via trackGap/stopIndicator;
//     determinate only, per M3). The header is iOS's.
//   Web: a 6px bar (4 / 10) on the raised surface whose fill glows in its own color, a
//     500 13 label and the percent at 500 12 in the mono face; `segments` splits the bar
//     into equal capsules 4px apart.

// iOS: a thin 4pt bar across all sizes, nudged up/down a hair by the size axis so `small`
// and `large` still read as distinct without ever losing the hairline iOS feel.
const IOS_HEIGHT: Record<Size, number> = { small: 3, base: 4, large: 6 };

// Android (M3): the M3 linear indicator is 4dp; the size axis steps it 3/4/8.
const ANDROID_HEIGHT: Record<Size, number> = { small: 3, base: 4, large: 8 };

// Web: 6px default, 4 small, 10 large.
const WEB_HEIGHT: Record<Size, number> = { small: 4, base: 6, large: 10 };

// The native header (iOS and Android): the title line at 500 14 / 20 in the foreground,
// the percent at 400 14 / 20 in the muted ink with tabular figures (so the digits do not
// jitter as the value ticks), the description one step below in the subtle ink.
function label(t: ColorTokens): TextStyle {
  return { fontWeight: "500", flexShrink: 1, color: t.foreground, fontSize: 14, lineHeight: 20 };
}
function description(t: ColorTokens): TextStyle {
  return { color: t["subtle-foreground"], fontSize: 12, lineHeight: 16 };
}
function valueReadout(t: ColorTokens): TextStyle {
  return { color: t["muted-foreground"], fontSize: 14, lineHeight: 20, fontWeight: "400", ...tabularNums() };
}

export const iosSkin: ProgressSkin = {
  height: IOS_HEIGHT,
  // iOS trackTint: a NEUTRAL translucent system fill (the hand-off's subtle ink at 25%),
  // never a wash of the progressTint.
  trackColor: (t: ColorTokens) => alpha(t["subtle-foreground"] ?? t["muted-foreground"], 0.25),
  fillColor: (t: ColorTokens) => t.primary,
  label,
  description,
  valueReadout,
  indeterminateWidth: 0.3,
};

export const androidSkin: ProgressSkin = {
  height: ANDROID_HEIGHT,
  // The inactive track on the raised surface (the hand-off's `--sf4`); the active
  // indicator and the stop indicator are the accent.
  trackColor: (t: ColorTokens) => t["surface-raised"] ?? t.secondary,
  fillColor: (t: ColorTokens) => t.primary,
  label,
  description,
  valueReadout,
  indeterminateWidth: 0.35,
  // M3 measurements (m3.material.io/components/progress-indicators/specs): a 4dp gap
  // between the active indicator's trailing edge and the inactive track, and the 4x4dp
  // stop indicator dot at the track's trailing edge. The shell renders both.
  trackGap: 4,
  stopIndicator: true,
};

// The web header: a 500 13 label in the foreground, a 400 12 description in the subtle
// ink, and the percent at 500 12 in the mono face and the muted ink.
function webLabel(t: ColorTokens): TextStyle {
  return { fontSize: 13, lineHeight: 17, fontWeight: "500", flexShrink: 1, color: t.foreground };
}
function webDescription(t: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "400", color: t["subtle-foreground"] };
}
function webValueReadout(t: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, fontWeight: "500", fontFamily: MONO_FONT, color: t["muted-foreground"], ...tabularNums() };
}

export const webSkin: ProgressSkin = {
  height: WEB_HEIGHT,
  // The raised surface as the rest of the bar (`--sf4`), the accent as the fill.
  trackColor: (t: ColorTokens) => t["surface-raised"] ?? t.secondary,
  fillColor: (t: ColorTokens) => t.primary,
  // The fill's glow: a 12px halo of its own color at 60%, clipped to the rail.
  fillGlow: (color: string) => ({ boxShadow: `0px 0px 12px ${alpha(color, 0.6)}` }),
  label: webLabel,
  description: webDescription,
  valueReadout: webValueReadout,
  indeterminateWidth: 0.38,
};

/** The segmented bar: equal capsules 4px apart, each the track's height. */
export const SEGMENTED_METER: { row: ViewStyle; segment: ViewStyle } = {
  row: { flexDirection: "row", gap: 4 },
  segment: { flexGrow: 1, flexShrink: 1, flexBasis: "0%", borderRadius: 9999 },
};
