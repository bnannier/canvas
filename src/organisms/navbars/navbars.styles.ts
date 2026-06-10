import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, shadow } from "../../style/index.js";

// Co-located Navbar styles. Layout-only fragments are static objects; anything
// that reads a color is a function of the active tokens (so the bar follows
// light/dark and reads as glass when the ThemeProvider's surface is "glass").

export type Surface = "default" | "bordered" | "floating";

// --- bar container ----------------------------------------------------------

// flex-row items-center justify-between h-14 px-4
export const barBase: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  height: 56,
  paddingHorizontal: 16,
};

// bg-background fill (token-driven, follows the scheme/glass surface).
export function barSurface(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.background };
}

// The surface axis. default rests flush with a bottom hairline; bordered boxes
// it in a rounded outline; floating lifts it as a rounded, shadowed card.
// - default:  border-b border-border
// - bordered: rounded-lg border border-border
// - floating: rounded-lg border border-border shadow-md
export function surfaceContainer(tokens: ColorTokens, surface: Surface): ViewStyle {
  switch (surface) {
    case "default":
      return { borderBottomWidth: 1, borderColor: tokens.border };
    case "bordered":
      return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border };
    case "floating":
      return { borderRadius: 8, borderWidth: 1, borderColor: tokens.border, ...shadow("md") };
  }
}

// --- left cluster (brand + links) -------------------------------------------

// flex-row items-center gap-4
export const leftGroup: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 16 };

// text-base font-semibold text-foreground
export function brand(tokens: ColorTokens): TextStyle {
  return { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground };
}

// flex-row items-center gap-1
export const linksRow: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 4 };

// rounded-md px-3 py-1.5 (the active:opacity-90 press feedback is applied by the
// Pressable callback in the component).
export const linkBase: ViewStyle = { borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 };

// The active link tile fill: bg-accent.
export function linkActive(tokens: ColorTokens): ViewStyle {
  return { backgroundColor: tokens.accent };
}

// text-sm font-medium; active reads in the foreground, inactive in muted.
export const linkLabelBase: TextStyle = { fontSize: 14, lineHeight: 20, fontWeight: "500" };

export function linkLabelColor(tokens: ColorTokens, active: boolean): TextStyle {
  return { color: active ? tokens.foreground : tokens["muted-foreground"] };
}

// --- right cluster (action + avatar) ----------------------------------------

// flex-row items-center gap-2
export const rightGroup: ViewStyle = { flexDirection: "row", alignItems: "center", gap: 8 };
