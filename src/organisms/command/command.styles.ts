import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow, alpha } from "../../style/index.js";

// Co-located Command skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so they follow light/dark and the glass surface, since
// tokens.popover is swapped translucent at the theming level). Command is a
// "Light" platform treatment: ONE structure (the GlassSurface panel, the search
// row, grouped result rows, the optional group heading, the optional footer, and
// the collapsed trigger) with small per-OS touches. The BRAND survives on every
// platform — the accent highlight, the popover/foreground/muted tokens, never a
// platform default color.
//
// The skin covers ONLY the search row + the grouped result rows + the active-row
// highlight, per the component guidance: the GlassSurface panel and its
// material, the card shell, the collapsed trigger, the group heading, the footer
// hint bar, and the Kbd caps stay shared in the shell and are NOT re-skinned.
//
// Reference catalog (PLATFORM-REFERENCES.md, command row): the web look matches
// shadcn/cmdk (the current Canvas look, lifted verbatim). iOS and Android have
// NO native command palette (both `(none)`), so those skins keep the same
// structure and apply only the platform's list-row conventions:
//   iOS (HIG grouped list rows): comfortable ~44pt rows, body type (17/22) with
//     tightened tracking, a slightly larger search row; the active/pressed row
//     tints with the brand `accent` and the row dims to ~0.8 opacity on press
//     (no ripple).
//   Android (Material 3 list items): ~48dp rows, body-large type (16/24), an
//     M3 search row; the active/pressed row tints with `accent` and press shows
//     an android_ripple (alpha(primary, 0.12) state layer).
//   Web: the established Canvas look (the current command rows, lifted verbatim)
//     — a 12/12 search row, 14/20 muted type, 12/8 result rows, 14/20 foreground
//     type, the `accent` fill for both the active and the pressed row.

// The contract a platform skin fulfills. The shell owns the structure (the
// GlassSurface panel, the card shell, the trigger, the group heading, the footer)
// and the open/close + active-index state; the skin maps tokens and the active
// row state to RN style objects for the search row and the result rows, and
// declares its press-feedback mode (iOS/web dim or tint inline, Android ripples).
export interface CommandSkin {
  /** The search row at the top of the panel: gap, padding, hairline under it. */
  searchRow: (t: ColorTokens) => ViewStyle;
  /** The leading magnifier glyph in the search row. */
  searchGlyph: (t: ColorTokens) => TextStyle;
  /** The muted placeholder text in the search row. */
  searchPlaceholder: (t: ColorTokens) => TextStyle;
  /** A single result row layout (gap, padding, min height). */
  rowBase: ViewStyle;
  /** The active/pressed row fill (the brand accent surface on every platform). */
  rowAccent: (t: ColorTokens) => ViewStyle;
  /** A row's leading glyph type. */
  rowIcon: (t: ColorTokens) => TextStyle;
  /** A row's label type (takes the remaining width). */
  rowLabel: (t: ColorTokens) => TextStyle;
  /** iOS/web dim a row on press; Android ripples instead (null). */
  rowPressedOpacity: number | null;
  /** Android ripple over the rows; null on iOS/web. */
  ripple: ((t: ColorTokens) => { color: string; borderless: boolean }) | null;
}

// ---------- card shell (shared across platforms) ----------
// The floating palette card: fixed width, rounded, bordered, raised, clipping
// its rounded corners. (w-[420px] rounded-lg border border-border bg-popover
// shadow-xl overflow-hidden.) GlassSurface strips the fill and supplies the
// material when the surface is glass; the shape (radius/border/clip) is the
// skin's. This is identical on every platform: only the rows are re-skinned.
export function card(tokens: ColorTokens): ViewStyle {
  return {
    width: 420,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.popover,
    overflow: "hidden",
    ...shadow("xl"),
  };
}

// In trigger mode the card floats below the collapsed trigger button.
// (absolute top-full left-0 z-50 mt-3.)
export const cardFloating: ViewStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  zIndex: 50,
  marginTop: 12,
};

// ---------- group heading (shared across platforms) ----------
// The optional uppercase section heading above a group's rows.
// (uppercase text-xs text-muted-foreground px-3 pt-3 pb-1.)
export function groupHeading(tokens: ColorTokens): TextStyle {
  return {
    textTransform: "uppercase",
    fontSize: 12,
    lineHeight: 16,
    color: tokens["muted-foreground"],
    paddingHorizontal: 12,
    paddingTop: 12,
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

// The collapsed full-width search trigger button.
// (flex-row items-center gap-2 w-full justify-start rounded-md border
//  border-input bg-transparent px-3 py-1.5.)
export function triggerRow(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: "100%",
    justifyContent: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: tokens.input,
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
export const triggerKbd: ViewStyle = { marginLeft: "auto" };

// ---------- footer hint bar (shared across platforms) ----------
// The footer hint bar below the list. (flex-row items-center gap-3 border-t
// border-border px-4 py-2.5.)
export function footerBar(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderTopWidth: 1,
    borderColor: tokens.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  };
}

// A single hint cluster in the footer (kbd cap(s) + its text).
// (flex-row items-center gap-1.)
export const footerHint: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };

// A hint's supporting text. (text-xs text-muted-foreground.)
export function footerText(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// A 12/12 search row with a hairline under it (px-3 py-3, 14/20 muted glyph +
// placeholder), result rows at px-3 py-2 (gap-3, 14/20 foreground), and the
// `accent` fill for both the active and the pressed row (active:bg-accent). The
// press feedback IS the accent fill (no opacity dim, no ripple).
export const webSkin: CommandSkin = {
  searchRow: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 12,
    paddingVertical: 12,
  }),
  searchGlyph: (t) => ({ fontSize: 14, lineHeight: 20, color: t["muted-foreground"] }),
  searchPlaceholder: (t) => ({ fontSize: 14, lineHeight: 20, color: t["muted-foreground"] }),
  rowBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  rowAccent: (t) => ({ backgroundColor: t.accent }),
  rowIcon: (t) => ({ fontSize: 14, lineHeight: 20, color: t.foreground }),
  rowLabel: (t) => ({
    fontSize: 14,
    lineHeight: 20,
    color: t.foreground,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  }),
  rowPressedOpacity: null,
  ripple: null,
};

// ---------- iOS (HIG grouped list rows): comfortable rows, body type, dim on press ----------
// iOS has no native command palette, so the structure is unchanged; the rows
// follow iOS grouped-list conventions: a comfortable ~44pt row height, iOS body
// type (17/22) with tightened tracking (-0.4), a slightly larger search row
// (px-4 py-3.5, 17/22 muted). The active/pressed row tints with the brand
// `accent` (not the iOS system fill) and the row dims to ~0.8 opacity on press;
// no ripple.
export const iosSkin: CommandSkin = {
  searchRow: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  }),
  searchGlyph: (t) => ({ fontSize: 17, lineHeight: 22, color: t["muted-foreground"] }),
  searchPlaceholder: (t) => ({
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
    color: t["muted-foreground"],
  }),
  rowBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 11,
    minHeight: 44,
  },
  rowAccent: (t) => ({ backgroundColor: t.accent }),
  rowIcon: (t) => ({ fontSize: 17, lineHeight: 22, color: t.foreground }),
  rowLabel: (t) => ({
    fontSize: 17,
    lineHeight: 22,
    letterSpacing: -0.4,
    color: t.foreground,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  }),
  rowPressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3 list items): 48dp rows, body-large, ripple ----------
// Android has no native command palette, so the structure is unchanged; the rows
// follow M3 list-item conventions: a ~48dp row height, M3 body-large type
// (16/24), an M3 search row (px-4 py-3.5, 16/24 muted). The active/pressed row
// tints with the brand `accent`, and press shows an android_ripple (the M3 state
// layer: alpha(primary, 0.12)).
export const androidSkin: CommandSkin = {
  searchRow: (t) => ({
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderBottomWidth: 1,
    borderColor: t.border,
    paddingHorizontal: 16,
    paddingVertical: 14,
  }),
  searchGlyph: (t) => ({ fontSize: 16, lineHeight: 24, color: t["muted-foreground"] }),
  searchPlaceholder: (t) => ({ fontSize: 16, lineHeight: 24, color: t["muted-foreground"] }),
  rowBase: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
  },
  rowAccent: (t) => ({ backgroundColor: t.accent }),
  rowIcon: (t) => ({ fontSize: 16, lineHeight: 24, color: t.foreground }),
  rowLabel: (t) => ({
    fontSize: 16,
    lineHeight: 24,
    color: t.foreground,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: "0%",
  }),
  rowPressedOpacity: null,
  ripple: (t) => ({ color: alpha(t.primary, 0.12), borderless: false }),
};
