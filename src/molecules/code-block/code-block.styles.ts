import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow, alpha, MONO_FONT } from "../../style/index.js";
import { type CodeBlockSkin } from "./code-block.shared.js";

// Co-located CodeBlock skins. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens, so the muted surface
// follows light/dark and reads as glass at the theming level. The terminal
// variant is intentionally a fixed dark window built from the Tailwind palette
// (zinc/emerald/red/amber/green), so it stays dark in every scheme.
//
// CodeBlock is a "Shared" platform treatment: neither iOS nor Android ships a code
// display control, and the web reference is the standard `pre`/`code` HTML pattern,
// so there is ONE look on every platform. `iosSkin` and `androidSkin` therefore
// reference the SAME object as `webSkin` (no fabricated per-OS difference); the skin
// contract exists only so the file pattern matches the rest of the kit.

export type Variant = "terminal" | "numbered" | "inline" | "plain";

// Monospace face: requested inline since RN has no font-family utility (the same
// approach Badge's `mono` modifier uses).
export const MONO = { fontFamily: MONO_FONT } as const;

// --- shared style fragments (the one look) ----------------------------------

// Shared code type: text-sm leading-relaxed.
const codeType: TextStyle = { fontSize: 14, lineHeight: 28 };

// Code foreground color (text-foreground).
function codeText(tokens: ColorTokens): TextStyle {
  return { color: tokens.foreground };
}

// The shared code surface: a muted, bordered, rounded card. (w-full self-start
// rounded-lg border border-border bg-muted/50)
function surface(tokens: ColorTokens): ViewStyle {
  return {
    width: "100%",
    alignSelf: "flex-start",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: alpha(tokens.muted, 0.5),
  };
}

// Surface padding (p-4) added on top of `surface`.
const surfacePad: ViewStyle = { padding: 16 };

// --- header bar (plain + numbered filename/language label) ------------------

// The header bar that carries the filename/language label, sitting above the code
// surface: a muted, bordered strip whose bottom edge meets the surface's top edge.
// flex-row items-center rounded-t-lg border border-b-0 border-border bg-muted px-4 py-2.
function headerBar(tokens: ColorTokens): ViewStyle {
  return {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    width: "100%",
    borderTopStartRadius: 8,
    borderTopEndRadius: 8,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: tokens.border,
    backgroundColor: tokens.muted,
    paddingHorizontal: 16,
    paddingVertical: 8,
  };
}

// The header label type: text-xs muted-foreground (the file/language name).
function headerLabel(tokens: ColorTokens): TextStyle {
  return { fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] };
}

// When a header bar sits above the surface, the surface's own top corners must be
// squared off so the two strips read as one card.
const surfaceUnderHeader: ViewStyle = { borderTopStartRadius: 0, borderTopEndRadius: 0 };

// --- inline variant ---------------------------------------------------------

// self-start rounded border border-border bg-muted px-1.5 py-0.5
function inlineBox(tokens: ColorTokens): ViewStyle {
  return {
    alignSelf: "flex-start",
    borderRadius: 4,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.muted,
    paddingHorizontal: 6,
    paddingVertical: 2,
  };
}

// The inline pill's own smaller size (text-[13px]).
const inlineType: TextStyle = { fontSize: 13 };

// --- terminal variant -------------------------------------------------------

// relative w-full self-start overflow-hidden rounded-lg border border-border shadow-sm
function terminalOuter(tokens: ColorTokens): ViewStyle {
  return {
    position: "relative",
    width: "100%",
    alignSelf: "flex-start",
    overflow: "hidden",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    ...shadow("sm"),
  };
}

// Chrome bar: flex-row items-center gap-1.5 border-b border-zinc-700 bg-zinc-800 px-4 py-2.5
const terminalChrome: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  borderBottomWidth: 1,
  borderColor: palette["zinc-700"],
  backgroundColor: palette["zinc-800"],
  paddingHorizontal: 16,
  paddingVertical: 10,
};

// Traffic-light dot: h-3 w-3 rounded-full bg-<hue>-500.
function trafficDot(hue: "red" | "amber" | "green"): ViewStyle {
  return { height: 12, width: 12, borderRadius: 9999, backgroundColor: palette[`${hue}-500`] };
}

// Chrome label: ml-2 text-xs text-zinc-400.
const terminalLabel: TextStyle = {
  marginStart: 8,
  fontSize: 12,
  lineHeight: 16,
  color: palette["zinc-400"],
};

// Terminal body: bg-zinc-900 p-4.
const terminalBody: ViewStyle = { backgroundColor: palette["zinc-900"], padding: 16 };

// A single command row: flex-row.
const terminalRow: ViewStyle = { flexDirection: "row" };

// The non-selectable "$ " prompt: text-emerald-400. `userSelect: "none"` keeps the
// shell glyph out of a copied selection (it is a cross-platform RN TextStyle prop).
const terminalPrompt: TextStyle = { color: palette["emerald-400"], userSelect: "none" };

// The command line itself: flex-1 text-zinc-100.
const terminalLine: TextStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  color: palette["zinc-100"],
};

// --- numbered variant -------------------------------------------------------

// The numbered surface row: flex-row p-4 (on top of `surface`).
const numberedSurface: ViewStyle = { flexDirection: "row", padding: 16 };

// The line-number gutter: mr-4 items-end.
const numberedGutter: ViewStyle = { marginEnd: 16, alignItems: "flex-end" };

// Dimmed line numbers (text-muted-foreground), sharing the code type.
// `userSelect: "none"` keeps the line numbers out of a copied selection, so the
// pasted block is clean, runnable code (cross-platform RN TextStyle prop).
function gutterText(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"], userSelect: "none" };
}

// The code column: flex-1.
const numberedCodeCol: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// --- copy affordance --------------------------------------------------------

// absolute right-2 top-2 z-10 flex-row items-center self-start rounded-md border px-2.5 py-1.
// The fill/border follows the dark branch: dark window vs light surface.
function copyButton(tokens: ColorTokens, dark: boolean): ViewStyle {
  const base: ViewStyle = {
    position: "absolute",
    end: 8,
    top: 8,
    zIndex: 10,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
  };
  // The `dark` flag here is the CopyButton's own (terminal forces it); it picks
  // the dark zinc chip vs the light background chip with a soft shadow.
  return dark
    ? { ...base, borderColor: palette["zinc-700"], backgroundColor: palette["zinc-800"] }
    : { ...base, borderColor: tokens.border, backgroundColor: tokens.background, ...shadow("sm") };
}

// Copy label: text-xs font-medium, color per dark branch.
function copyText(tokens: ColorTokens, dark: boolean): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: dark ? palette["zinc-300"] : tokens["muted-foreground"],
  };
}

// ---------- Web: the established Canvas look (lifted verbatim) ----------
// The current code-block surface: a muted, bordered, rounded card with the
// terminal / numbered / inline variants and the copy chip described above. This is
// the single source of truth for the one shared look.
export const webSkin: CodeBlockSkin = {
  codeType,
  codeText,
  surface,
  surfacePad,
  headerBar,
  headerLabel,
  surfaceUnderHeader,
  inlineBox,
  inlineType,
  terminalOuter,
  terminalChrome,
  trafficDot,
  terminalLabel,
  terminalBody,
  terminalRow,
  terminalPrompt,
  terminalLine,
  numberedSurface,
  numberedGutter,
  gutterText,
  numberedCodeCol,
  copyButton,
  copyText,
  copyPressedOpacity: 0.8,
};

// ---------- iOS / Android: identical to web (Shared treatment) ----------
// CodeBlock has no native iOS/Android control to match (the reference catalog marks
// both `(none)`), so there is one look everywhere. These intentionally reference the
// same object as `webSkin`; do NOT fabricate per-OS differences here.
export const iosSkin: CodeBlockSkin = webSkin;
export const androidSkin: CodeBlockSkin = webSkin;
