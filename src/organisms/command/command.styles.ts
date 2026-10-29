import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, surfaceRipple, shape } from "../../style/index.js";
import { activeIndicator } from "../../style/active-indicator.js";
import { fieldBorder } from "../../style/field-colors.js";
import { MONO_FONT } from "../../style/mono.js";
import { primaryText } from "../../style/primary-text.js";
import { platformShape } from "../../style/platform-shape.js";

// Co-located Command skins, one per platform, all driven by the theme tokens (passed in
// from useTheme so they follow the palette, the scheme and the glass surface: the shell
// renders the panel through GlassSurface, which strips the skin's fill and paints the
// functional layer; the `popover` token itself is opaque in both modes). Command is the
// v4 hand-off's palette (its `command` renderer, tools/v4/handoff/cv-kit-overlays.js):
// a 520 panel at the command panel corner in the overlay material (the `popover` fill, the
// `field-border` hairline, the lg shadow), a 48 search row (15px type, a 17px subtle
// glyph, the compact flat `esc` hint cap) over a hairline, 6-inset groups under 11px mono eyebrows, 38px
// rows (14px labels, 15px subtle icons, 11px mono shortcuts) whose active row takes the
// accent's soft wash and an accent-ink icon, and a 36 footer of mono hints.
//
// Neither iOS nor Android ships a command palette (PLATFORM-REFERENCES.md, command
// row), so both take the web look in the platform's face; only the platform touches
// stay: rows at the 44pt / 48dp minimum, the continuous corner on iOS, the bounded
// ripple on Android.

// The contract a platform skin fulfills. The shell owns the structure (the
// GlassSurface panel, the card shell, the trigger, the group heading, the footer)
// and the open/close + active-index state; the skin maps tokens and the active
// row state to RN style objects for the search row and the result rows, and
// declares its press-feedback mode (iOS/web dim or tint inline, Android ripples).
export interface CommandSkin {
  /**
   * The search row at the top of the panel: gap, padding, and the hairline under it,
   * which turns `ring` and thickens while the search field holds focus (the field's
   * keyboard focus indicator; the field suppresses the browser ring for it).
   */
  searchRow: (t: ColorTokens, focused: boolean) => ViewStyle;
  /** The leading magnifier glyph size (px), rendered through the kit `Icon`
   *  atom (`search`, tinted muted-foreground) — never a color emoji. */
  searchGlyphSize: number;
  /** The leading magnifier glyph's ink. */
  searchGlyphColor: (t: ColorTokens) => string;
  /** The search input's type metrics, in the muted placeholder color (the
   *  shell repaints typed text with `foreground`). */
  searchPlaceholder: (t: ColorTokens) => TextStyle;
  /** The card's per-OS shape override (radius, and `borderCurve` on iOS): merged
   *  over the shared `card()` base so iOS gets a rounder, continuous corner. */
  cardShape: ViewStyle;
  /** The collapsed trigger row's minimum tap height (px): the HIG/M3 minimum on
   *  the native rows (44pt iOS, 48dp Android), the web look on web. */
  triggerMinHeight: number;
  /** The collapsed trigger row's resting border: the search-field hairline
   *  (`field-border`, see src/style/field-colors.ts) on web and iOS, where the
   *  trigger reads as a field; the 3:1 `input` boundary on Android. */
  triggerBorder: (t: ColorTokens) => string;
  /** A single result row layout (gap, padding, min height). */
  rowBase: ViewStyle;
  /** The active/pressed row fill (the brand accent surface on every platform). */
  rowAccent: (t: ColorTokens) => ViewStyle;
  /** A row's leading Canvas icon size (px), per platform. */
  iconSize: number;
  /** A row's leading icon ink, resting and on the active row. */
  iconColor: (t: ColorTokens, active: boolean) => string;
  /** A row's trailing shortcut, as mono text; `active` on the highlighted row. */
  shortcut: (t: ColorTokens, active: boolean) => TextStyle;
  /** A row's label type (takes the remaining width). */
  rowLabel: (t: ColorTokens) => TextStyle;
  /** iOS/web dim a row on press; Android ripples instead (null). */
  rowPressedOpacity: number | null;
  /** Android ripple over the rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// ---------- card shell (shared across platforms) ----------
// The floating palette card: the hand-off's 520px width, bordered, raised, clipping
// its rounded corners. `maxWidth:"100%"` beside the width is the floating-container
// pattern (a palette is a bounds provider for its own content): it keeps the 520px
// desktop palette but shrinks the card inside a narrower parent, so it never
// overflows a 390/393pt iPhone or a 360dp Android phone. GlassSurface strips the fill
// and supplies the material when the surface is glass; the shape (border/clip) is the
// skin's, and the corner is the per-OS `skin.cardShape` layered over this base, which
// every use applies with it. This base is identical on every platform: only the rows
// and the corner shape are re-skinned.
export const CARD_WIDTH = 520;

export function card(tokens: ColorTokens): ViewStyle {
  return {
    width: CARD_WIDTH,
    maxWidth: "100%",
    borderWidth: 1,
    borderColor: tokens["field-border"],
    backgroundColor: tokens.popover,
    overflow: "hidden",
    ...shadow("lg", tokens),
  };
}

// Embedded palettes inherit the containing overlay's surface and width. The
// scrollport caps long result sets at the hand-off's 340 (Overlays.dc.html, the palette's
// list) and may shrink further with its parent; the footer sits below it in the column,
// so a row never runs under the footer.
export const embedded: ViewStyle = { width: "100%", minWidth: 0, minHeight: 0, flexShrink: 1 };
export const results: ViewStyle = { maxHeight: 340, minHeight: 0, flexShrink: 1 };
// The groups' inset inside the scrollport (the hand-off's 6).
export const resultsContent: ViewStyle = { padding: 6 };
export const rowText: ViewStyle = { flex: 1, minWidth: 0 };
export const stackedLabel: TextStyle = { flexGrow: 0, flexBasis: "auto" };
export function rowDescription(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// In trigger mode the card floats below the collapsed trigger button.
// (absolute top-full left-0 z-50 mt-3.)
export const cardFloating: ViewStyle = {
  position: "absolute",
  top: "100%",
  start: 0,
  zIndex: 50,
  marginTop: 12,
};

// ---------- group heading (shared across platforms) ----------
// The optional section heading above a group's rows: the hand-off's 11px mono eyebrow,
// uppercase at 0.08em in the subtle ink, 8 above, 10 in, 4 below.
export function groupHeading(tokens: ColorTokens): TextStyle {
  return {
    fontFamily: MONO_FONT,
    textTransform: "uppercase",
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    letterSpacing: 0.88,
    color: tokens["subtle-foreground"] ?? tokens["muted-foreground"],
    paddingHorizontal: 10,
    paddingTop: 8,
    paddingBottom: 4,
  };
}

// ---------- collapsed trigger (shared across platforms) ----------
// The wrapper around the collapsed trigger + the floating card. (relative w-full.)
export const triggerWrapper: ViewStyle = { position: "relative", width: "100%" };

// When the palette is open in trigger mode, the wrapper is lifted into its own
// stacking context above sibling content. react-native-web gives every
// positioned View an implicit stacking context, so the floating card's own
// `zIndex` is scoped INSIDE the `relative` wrapper and cannot rise above a later
// sibling. Raising the wrapper's zIndex while open lifts the whole control —
// trigger and palette together — above everything painted after it.
export const triggerWrapperLifted: ViewStyle = { zIndex: 50 };

// The collapsed full-width search trigger: a search field at the field corner (a row of
// glyph and placeholder, gap 8, a border on a transparent fill, padding 12/6).
export function triggerRow(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "flex-start",
    borderRadius: shape.web.field,
    borderWidth: 1,
    backgroundColor: "transparent",
    paddingHorizontal: 12,
    paddingVertical: 6,
  };
}

// The trigger button's "Search..." label. (text-sm text-foreground.)
export function triggerLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens.foreground };
}

// Pushes the trailing kbd cap to the right edge of the trigger. (ml-auto.)
export const triggerKbd: ViewStyle = { marginStart: "auto" };

// ---------- empty state (shared across platforms) ----------
// The muted "No results" row shown when the query matches nothing.
export const emptyRow: ViewStyle = {
  alignItems: "center",
  paddingHorizontal: 12,
  paddingVertical: 24,
};

// The empty row's supporting text. (text-sm text-muted-foreground.)
export function emptyText(tokens: ColorTokens): TextStyle {
  return { fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] };
}

// ---------- footer hint bar (shared across platforms) ----------
// The hand-off's 36 footer under a hairline: 14 in, 14 between its mono hints.
export function footerBar(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 14,
    minHeight: 36,
    borderTopWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: 14,
  };
}

// A hint's text: 11px mono in the subtle ink.
export function footerText(tokens: ColorTokens): TextStyle {
  return { fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "400", color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
}

// ---------- Web: the v4 hand-off's palette ----------
const subtle = (t: ColorTokens) => t["subtle-foreground"] ?? t["muted-foreground"];
export const webSkin: CommandSkin = {
  // A 48 row, 16 in, a 10 gap, its hairline turning `ring` and thickening on focus.
  searchRow: (t, focused) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    minHeight: 48,
    ...activeIndicator({ active: focused, restColor: t.border, activeColor: t.ring, gap: 0 }),
  }),
  searchGlyphSize: 17,
  searchGlyphColor: subtle,
  searchPlaceholder: (t) => ({ fontSize: 15, lineHeight: 19, color: subtle(t) }),
  // The command panel corner.
  cardShape: { borderRadius: platformShape.web.commandPanel },
  triggerMinHeight: 40,
  triggerBorder: (t) => fieldBorder(t),
  // A 38 row, 10 in, a 10 gap, at the command row corner.
  rowBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 10,
    minHeight: 38,
    borderRadius: platformShape.web.commandRow,
  },
  rowAccent: (t) => ({ backgroundColor: t["primary-soft"] ?? t.accent }),
  iconSize: 15,
  iconColor: (t, active) => (active ? primaryText(t) : subtle(t)),
  // The subtle ink falls to about 3.4:1 on the active row's accent wash in the dark scheme,
  // so the highlighted row's shortcut steps up to the muted ink, which clears 4.5:1 there.
  shortcut: (t, active) => ({ fontFamily: MONO_FONT, fontSize: 11, lineHeight: 14, fontWeight: "400", color: active ? t["muted-foreground"] : subtle(t) }),
  rowLabel: (t) => ({
    fontSize: 14,
    lineHeight: 18,
    color: t.foreground,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  }),
  rowPressedOpacity: null,
  ripple: null,
};

// ---------- iOS: the web palette, 44pt rows, the continuous corner ----------
// No iOS control is a command palette, so the card is the web's in SF Pro, with the
// continuous corner curve iOS surfaces use; the rows keep the HIG's 44pt minimum and dim
// to 0.8 on press.
export const iosSkin: CommandSkin = {
  ...webSkin,
  cardShape: { ...webSkin.cardShape, borderCurve: "continuous" },
  triggerMinHeight: 44,
  rowBase: { ...webSkin.rowBase, minHeight: 44 },
  rowPressedOpacity: 0.8,
};

// ---------- Android: the web palette, 48dp rows, the ripple ----------
// Material 3 has no command palette, so the card is the web's in Roboto; the rows keep
// the 48dp minimum, the trigger the 3:1 `input` boundary, and a press shows the bounded
// surface ripple (on-surface ink at about 10%).
export const androidSkin: CommandSkin = {
  ...webSkin,
  triggerMinHeight: 48,
  triggerBorder: (t) => t.input,
  rowBase: { ...webSkin.rowBase, minHeight: 48 },
  ripple: (t) => surfaceRipple(t),
};
