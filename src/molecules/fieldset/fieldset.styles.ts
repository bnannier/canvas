import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Fieldset skins, one per platform. Layout-only parts are static; anything
// that reads a color is a function of the active tokens (so the bordered surface
// follows light/dark). Fieldset is a CONTENT-layer surface that paints tokens.card,
// which stays SOLID under glass (only the functional/popover layer frosts). The responsive
// collapse (two-column -> single column at the `sm` breakpoint) is driven by
// useResponsive in the shell, with the column gap/width supplied by the skin.
//
// Fieldset is a "Light" platform treatment: ONE structure (legend + description +
// stacked field group, optionally inside a bordered card-like section) on every
// platform. The BRAND survives everywhere (the `primary`/`destructive` tokens and
// the type live in the controls and the shared shell); only the native SHAPE
// (corner radius), DENSITY (padding / inter-field gap), TYPE TRACKING, and surface
// ELEVATION shift per OS:
//   iOS (HIG Boxes / SwiftUI GroupBox): a rounded grouped box (12pt continuous-
//     corner radius) over the `secondary` background fill (HIG boxes separate their
//     contents with a fill, not a shadow: iOS uses the secondary/tertiary background
//     colors), ~16pt inset, no shadow; SF Pro Text tracking on the legend/label.
//   Android (none: M3 has no fieldset; related fields are grouped with layout,
//     section headers, and dividers). We keep the structure and apply M3
//     conventions: a more-rounded surface (12dp), a subtly elevated card (M3
//     elevation level 1), denser inter-field spacing, and M3 label tracking
//     (+0.1..+0.5 on the supporting/label type). Fieldset owns no pressable rows
//     of its own (its interactive children are the already-skinned Input/Checkbox
//     atoms), so there is no ripple surface to add here.
//   Web: the established Canvas look (the current fieldset, lifted verbatim) — a
//     bordered card-like section (8 radius, 1px `border`, `card` fill, padding 20),
//     a 16pt/600 legend and 12pt muted description, fields stacked with a 16 gap.

export type Surface = "bordered" | "plain";

// The contract a platform skin fulfills. The shell renders the container, header
// (legend + description), the field rows, the checkbox group, and the two-column
// wrap; the skin maps the active platform's shape/padding/type/tracking/elevation
// onto each piece.
export interface FieldsetSkin {
  /** Bordered surface fill/border/shape/padding/elevation (tokens drive fill). The
   *  plain (borderless) surface is empty on every platform; the skin owns the
   *  bordered chrome. */
  surface: (t: ColorTokens, s: Surface) => ViewStyle;
  /** The legend heading type (size / line-height / weight / tracking / color). */
  legend: (t: ColorTokens) => TextStyle;
  /** The muted supporting line under the legend. */
  description: (t: ColorTokens) => TextStyle;
  /** Spacing below the header block. */
  header: ViewStyle;
  /** A field's persistent label above its control. */
  fieldLabel: (t: ColorTokens) => TextStyle;
  /** The muted help line beneath a control. */
  fieldHelp: (t: ColorTokens) => TextStyle;
  /** The inline error beneath a control. */
  fieldError: (t: ColorTokens) => TextStyle;
  /** Vertical gap between stacked field rows in the single-column group. */
  groupGap: number;
  /** Gap (both axes) of the two-column wrap before it collapses. */
  twoColumnGap: number;
  /** Vertical gap between rows in the checkbox group. */
  checkboxGap: number;
  /** Min-height + vertical centering for each checkbox row so its effective tap
   *  target reaches the platform minimum (>=44pt iOS / >=48dp Android). Empty on
   *  web so the established web layout is unchanged. */
  checkboxRow: ViewStyle;
  /** Opacity applied to the whole group when disabled. */
  disabledOpacity: number;
}

// --- shared layout fragments (identical across platforms) -------------------

// Outer container: full width, capped at 576px. (w-full max-w-[576px])
export const containerBase: ViewStyle = { width: "100%", maxWidth: 576 };

// A single field's wrapper. (w-full)
export const fieldWrap: ViewStyle = { width: "100%" };

// `grow` on a two-column item. (grow)
export const itemGrow: ViewStyle = { flexGrow: 1 };

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current fieldset: a borderless plain group, or a bordered card-like section
// (rounded-lg border border-border bg-card p-5); a 16pt/600 legend and a 12pt muted
// description (mb-4 header); each field a 14pt/500 label over its control, with a
// 12pt muted help line or 12pt destructive error beneath; fields stacked with gap 16,
// the two-column wrap and the checkbox group both keeping their current spacing.
export const webSkin: FieldsetSkin = {
  surface: (t, s) =>
    s === "bordered"
      ? { borderRadius: 8, borderWidth: 1, borderColor: t.border, backgroundColor: t.card, padding: 20 }
      : {},
  legend: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "600", color: t.foreground }),
  description: (t) => ({ marginTop: 4, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  header: { marginBottom: 16 },
  fieldLabel: (t) => ({ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: t.foreground }),
  fieldHelp: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 16, color: t["muted-foreground"] }),
  fieldError: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 16, color: t.destructive }),
  groupGap: 16,
  twoColumnGap: 16,
  checkboxGap: 8,
  checkboxRow: {},
  disabledOpacity: 0.6,
};

// ---------- iOS (HIG Boxes / SwiftUI GroupBox): rounded grouped box, flat ----------
// A grouped box: a rounded section (12pt continuous/superellipse corners) over the
// secondary background fill with NO shadow (HIG boxes separate their contents with a
// fill, not a drop shadow: iOS/iPadOS "use the secondary and tertiary background
// colors in boxes"); a 16pt inset. SF-style type: SF Pro Text tracking (legend 16pt
// = -0.31, label 14pt = -0.15, help/error 12pt = 0); the plain group stays borderless.
const IOS_RADIUS = 12;
export const iosSkin: FieldsetSkin = {
  surface: (t, s) =>
    s === "bordered"
      ? { borderRadius: IOS_RADIUS, borderCurve: "continuous", backgroundColor: t.secondary, padding: 16 }
      : {},
  legend: (t) => ({ fontSize: 16, lineHeight: 22, fontWeight: "600", letterSpacing: -0.31, color: t.foreground }),
  description: (t) => ({ marginTop: 4, fontSize: 13, lineHeight: 18, letterSpacing: -0.08, color: t["muted-foreground"] }),
  header: { marginBottom: 16 },
  fieldLabel: (t) => ({ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: -0.15, color: t.foreground }),
  fieldHelp: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 16, letterSpacing: 0, color: t["muted-foreground"] }),
  fieldError: (t) => ({ marginTop: 6, fontSize: 12, lineHeight: 16, letterSpacing: 0, color: t.destructive }),
  groupGap: 16,
  twoColumnGap: 16,
  checkboxGap: 8,
  // HIG minimum touch target 44x44pt; grouped-list selection rows are 44pt. The
  // checkbox row is a flex ROW, so alignItems (cross axis) centers it vertically.
  checkboxRow: { minHeight: 44, alignItems: "center" },
  disabledOpacity: 0.6,
};

// ---------- Android (none: M3 has no fieldset) — M3 conventions on the shared shell ----------
// M3 groups related fields with layout, section headers, and dividers, with no
// fieldset component. We keep the structure and apply M3 conventions: a more-rounded
// surface (12dp), a subtly elevated card (M3 elevation level 1: a soft shadow, the
// flat `card` fill), and M3 type tracking on the supporting/label type (label-large
// +0.1, body-small +0.4). The inter-field spacing tightens to M3's denser rhythm.
const ANDROID_RADIUS = 12;
export const androidSkin: FieldsetSkin = {
  surface: (t, s) =>
    s === "bordered"
      ? { borderRadius: ANDROID_RADIUS, backgroundColor: t.card, padding: 16, ...shadow("sm") }
      : {},
  // Legend = M3 title-medium: 16sp / 24 line / 500 weight / +0.15 tracking (600 is
  // not an M3 type-scale weight; M3 uses 400/500/700 only).
  legend: (t) => ({ fontSize: 16, lineHeight: 24, fontWeight: "500", letterSpacing: 0.15, color: t.foreground }),
  description: (t) => ({ marginTop: 4, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t["muted-foreground"] }),
  header: { marginBottom: 16 },
  fieldLabel: (t) => ({ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", letterSpacing: 0.1, color: t.foreground }),
  // M3 text-field supporting text: body-small inset 16dp to align with the field's
  // text, 4dp below the container.
  fieldHelp: (t) => ({ marginTop: 4, paddingHorizontal: 16, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t["muted-foreground"] }),
  fieldError: (t) => ({ marginTop: 4, paddingHorizontal: 16, fontSize: 12, lineHeight: 16, letterSpacing: 0.4, color: t.destructive }),
  groupGap: 12,
  twoColumnGap: 12,
  checkboxGap: 8,
  // M3 minimum touch target 48x48dp; selection-list rows reserve a 48dp target.
  checkboxRow: { minHeight: 48, alignItems: "center" },
  // M3 disabled content = 38% opacity.
  disabledOpacity: 0.38,
};
