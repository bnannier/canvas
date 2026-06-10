import { type ViewStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Skeleton styles. Every placeholder shares one muted fill (a color,
// so it reads the active token); the rest is layout-only (line heights, the
// avatar/button footprints, and the composite card/list/table scaffolds). The
// component resolves its shape and size axes and composes these fragments.

export type Shape = "text" | "avatar" | "button" | "card" | "list" | "table";

// The muted fill every placeholder shares (was `bg-muted`).
export function fill(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.muted };
}

// --- line (the building block for text and composite shapes) ----------------

// A single muted line base: full width, the default line height (`h-3.5`), the
// small radius (`rounded`). Was `h-3.5 rounded w-full`.
export const lineBase: ViewStyle = { height: 14, borderRadius: 4, width: "100%" };

// --- text shape: line height per size --------------------------------------

// Line height per size; the default line reads like a single row of text.
// `h-4` -> 16, `h-3` -> 12, `h-3.5` -> 14.
export function lineHeight(p: { small?: boolean; large?: boolean }): ViewStyle {
  if (p.large) return { height: 16 };
  if (p.small) return { height: 12 };
  return { height: 14 };
}

// The text-line radius (`rounded`) plus its full-width default (`w-full`), which
// the caller's `style` escape hatch can override (e.g. width: "60%").
export const textBase: ViewStyle = { borderRadius: 4, width: "100%" };

// --- avatar shape: diameter per size ----------------------------------------

// Avatar diameter per size + the full radius (`rounded-full`).
// `w-12 h-12` -> 48, `w-8 h-8` -> 32, `w-10 h-10` -> 40.
export function avatarSize(p: { small?: boolean; large?: boolean }): ViewStyle {
  const d = p.large ? 48 : p.small ? 32 : 40;
  return { width: d, height: d, borderRadius: 9999 };
}

// --- button shape: footprint per size ---------------------------------------

// Button placeholder footprint per size + the medium radius (`rounded-md`);
// mirrors the real control's height. `h-12 w-32` -> {48,128},
// `h-8 w-20` -> {32,80}, `h-9 w-28` -> {36,112}.
export function buttonSize(p: { small?: boolean; large?: boolean }): ViewStyle {
  if (p.large) return { height: 48, width: 128, borderRadius: 6 };
  if (p.small) return { height: 32, width: 80, borderRadius: 6 };
  return { height: 36, width: 112, borderRadius: 6 };
}

// --- card shape -------------------------------------------------------------

// The card surface: rounded-lg border on the card fill, capped width, padded.
// `rounded-lg border border-border bg-card max-w-[320px] p-4`.
export function cardSurface(tokens: ColorTokens): ViewStyle {
  return {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    maxWidth: 320,
    padding: 16,
  };
}

// The card's identity row (avatar + two lines). `flex-row items-center gap-3 mb-4`.
export const cardRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 16 };

// The card avatar pulse. `shrink-0 rounded-full w-10 h-10`.
export const cardAvatar: ViewStyle = { flexShrink: 0, borderRadius: 9999, width: 40, height: 40 };

// The flex column holding the avatar's two lines. `flex-1`.
export const flexFill: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// Line widths inside the card (`w-[70%]` / `w-[40%]` / `w-[80%]`).
export const cardLine70: ViewStyle = { width: "70%" };
export const cardLine40: ViewStyle = { width: "40%", marginTop: 6 };
export const cardLine80: ViewStyle = { width: "80%", marginTop: 6 };

// --- list shape -------------------------------------------------------------

// The list container. `flex-col gap-4 max-w-[400px]`.
export const listContainer: ViewStyle = { flexDirection: "column", gap: 16, maxWidth: 400 };

// A list row. `flex-row items-center gap-3`.
export const listRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12 };

// The list row's avatar pulse. `rounded-full w-8 h-8`.
export const listAvatar: ViewStyle = { borderRadius: 9999, width: 32, height: 32 };

// The list row's primary line spacing. `mb-1.5`.
export const listLineGap: ViewStyle = { marginBottom: 6 };

// The list row's trailing meta line. `w-10`.
export const w10: ViewStyle = { width: 40 };

// --- table shape ------------------------------------------------------------

// The table container. `max-w-[560px]`.
export const tableContainer: ViewStyle = { maxWidth: 560 };

// A table row. `flex-row items-center gap-3 py-3`.
export const tableRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 12 };

// The hairline divider between table rows (omitted on the last row).
// `border-b border-border`.
export function tableDivider(tokens: ColorTokens): ViewStyle {
  return { borderBottomWidth: 1, borderColor: tokens.border };
}

// The table row's trailing cell line. `w-20`.
export const w20: ViewStyle = { width: 80 };
