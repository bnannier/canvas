import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow, alpha } from "../../style/index.js";

// Co-located CodeBlock styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens, so the muted surface
// follows light/dark and reads as glass at the theming level. The terminal
// variant is intentionally a fixed dark window built from the Tailwind palette
// (zinc/emerald/red/amber/green), so it stays dark in every scheme.

export type Variant = "terminal" | "numbered" | "inline" | "plain";

// Monospace face: requested inline since RN has no font-family utility (the same
// approach Badge's `mono` modifier uses).
export const MONO = { fontFamily: "monospace" } as const;

// Shared code type: text-sm leading-relaxed.
export const codeType: TextStyle = { fontSize: 14, lineHeight: 28 };

// Code foreground color (text-foreground).
export function codeText(tokens: ColorTokens): TextStyle {
  return { color: tokens.foreground };
}

// The shared code surface: a muted, bordered, rounded card. (w-full self-start
// rounded-lg border border-border bg-muted/50)
export function surface(tokens: ColorTokens): ViewStyle {
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
export const surfacePad: ViewStyle = { padding: 16 };

// --- outer wrappers ---------------------------------------------------------

// relative
export const relative: ViewStyle = { position: "relative" };

// --- inline variant ---------------------------------------------------------

// self-start rounded border border-border bg-muted px-1.5 py-0.5
export function inlineBox(tokens: ColorTokens): ViewStyle {
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

// --- terminal variant -------------------------------------------------------

// relative w-full self-start overflow-hidden rounded-lg border border-border shadow-sm
export function terminalOuter(tokens: ColorTokens): ViewStyle {
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
export const terminalChrome: ViewStyle = {
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
export function trafficDot(hue: "red" | "amber" | "green"): ViewStyle {
  return { height: 12, width: 12, borderRadius: 9999, backgroundColor: palette[`${hue}-500`] };
}

// Chrome label: ml-2 text-xs text-zinc-400.
export const terminalLabel: TextStyle = {
  marginLeft: 8,
  fontSize: 12,
  lineHeight: 16,
  color: palette["zinc-400"],
};

// Terminal body: bg-zinc-900 p-4.
export const terminalBody: ViewStyle = { backgroundColor: palette["zinc-900"], padding: 16 };

// A single command row: flex-row.
export const terminalRow: ViewStyle = { flexDirection: "row" };

// The non-selectable "$ " prompt: text-emerald-400.
export const terminalPrompt: TextStyle = { color: palette["emerald-400"] };

// The command line itself: flex-1 text-zinc-100.
export const terminalLine: TextStyle = {
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: "0%",
  color: palette["zinc-100"],
};

// --- numbered variant -------------------------------------------------------

// The numbered surface row: flex-row p-4 (on top of `surface`).
export const numberedSurface: ViewStyle = { flexDirection: "row", padding: 16 };

// The line-number gutter: mr-4 items-end.
export const numberedGutter: ViewStyle = { marginRight: 16, alignItems: "flex-end" };

// Dimmed line numbers (text-muted-foreground), sharing the code type.
export function gutterText(tokens: ColorTokens): TextStyle {
  return { color: tokens["muted-foreground"] };
}

// The code column: flex-1.
export const numberedCodeCol: ViewStyle = { flexGrow: 1, flexShrink: 1, flexBasis: "0%" };

// --- copy affordance --------------------------------------------------------

// absolute right-2 top-2 z-10 flex-row items-center self-start rounded-md border px-2.5 py-1.
// The fill/border follows the dark branch: dark window vs light surface.
export function copyButton(tokens: ColorTokens, dark: boolean): ViewStyle {
  const base: ViewStyle = {
    position: "absolute",
    right: 8,
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
export function copyText(tokens: ColorTokens, dark: boolean): TextStyle {
  return {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    color: dark ? palette["zinc-300"] : tokens["muted-foreground"],
  };
}
