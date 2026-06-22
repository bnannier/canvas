import { type ViewStyle, type TextStyle } from "react-native";
import { type ColorTokens, palette, shadow, alpha } from "../../style/index.js";
import { type StatsSkin } from "./stats.shared.js";

// Co-located Stats skins, one per platform, all driven by the brand tokens
// (passed in from useTheme so the surfaces follow light/dark and read as glass
// when tokens.card is swapped translucent at the theming level). The delta tone
// uses the Tailwind palette (a 600 hue in light, a 400 hue in dark), branched on
// the active scheme; that semantic color logic lives once in stats.shared.tsx, so
// the skin carries only the per-OS-varying pieces.
//
// Stats is a "Light" platform treatment: ONE structure (a wrapping row of
// label/value/delta metric stacks, optionally each in its own surface), with only
// small per-OS touches: corner radius, density/spacing, type tracking, shadow vs
// M3 outline, and the press feedback on a tappable item. Neither iOS nor Android
// ships a stat-tile control, so the native skins keep the structure and apply only
// platform conventions; they do NOT invent a new shape.
//   Web: the established Canvas look (the current stats, lifted verbatim) — a
//     bordered card surface (8 radius, 1px `border`, `card` fill, shadow-sm, p20),
//     the plain parent at p24, gaps 14/24, value 24/600 with -0.4 tracking, label
//     14 muted, delta 12/500. Press = opacity dim (0.9).
//   iOS (HIG / SF): iOS has no stat-tile control, so this stays a card-like inset
//     surface following SF conventions — a softer 12-radius corner, the same hairline
//     border with NO shadow (iOS inset-grouped surfaces read flat), slightly tighter
//     density, and SF tracking tightened on the value (-0.5) and the label (-0.2).
//     Press = opacity dim (~0.8).
//   Android (Material 3 card): M3 has no stat component, so this stays an M3
//     outlined card — a 12-radius corner, a 1px outline and NO shadow (M3 outlined
//     cards are flat), M3 label tracking (+0.1 on the value, +0.1 on the label/delta
//     for M3 label/body styles). Press = android_ripple (neutral surface state
//     layer); no opacity dim.

export type Surface = "card" | "plain";

// A wrapping row: items flow left to right and wrap to the next line when they
// run out of room (flex-row flex-wrap). Identical on every platform.
export const row: ViewStyle = { flexDirection: "row", flexWrap: "wrap" };

// --- semantic / platform-neutral pieces (shared by every skin) --------------

// Per-item minimum width and growth, by surface. Card items hold a wider floor
// and grow (flex-1 min-w-48); plain stacks pack tighter (min-w-28). Identical
// on every platform (a layout contract, not a per-OS touch).
export const item: Record<Surface, ViewStyle> = {
  card: { flexGrow: 1, flexShrink: 1, flexBasis: "0%", minWidth: 192 },
  plain: { minWidth: 112 },
};

// Delta tone: a rise reads green (text-green-600 dark:text-green-400), a decline
// reads red (text-red-600 dark:text-red-400). Semantic color, shared.
export function deltaTone(dark: boolean, down: boolean): TextStyle {
  const hue = down ? "red" : "green";
  return { color: dark ? palette[`${hue}-400`] : palette[`${hue}-600`] };
}

// ---------- Web: the established Canvas look (lifted verbatim) ----------
export const webSkin: StatsSkin = {
  // rounded-lg border border-border bg-card shadow-sm p-5
  cardSurface: (tokens: ColorTokens): ViewStyle => ({
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 20,
    ...shadow("sm"),
  }),
  // rounded-lg border border-border bg-card shadow-sm p-6
  plainContainer: (tokens: ColorTokens): ViewStyle => ({
    borderRadius: 8,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 24,
    ...shadow("sm"),
  }),
  // gap-3.5 (cards) / gap-6 (plain)
  rowGap: { card: { gap: 14 }, plain: { gap: 24 } },
  // card: text-sm mb-3 / plain: text-base mb-4
  title: (tokens: ColorTokens, surface: Surface): TextStyle =>
    surface === "card"
      ? { fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground, marginBottom: 12 }
      : { fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground, marginBottom: 16 },
  // text-sm text-muted-foreground
  labelText: (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }),
  // mt-1 text-2xl font-semibold tracking-tight text-foreground
  valueText: (tokens: ColorTokens): TextStyle => ({
    marginTop: 4,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    letterSpacing: -0.4,
    color: tokens.foreground,
  }),
  // mt-1 text-xs font-medium (tone color layered on top by the shell)
  deltaBase: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: "500" },
  pressedOpacity: 0.9,
  ripple: (tokens) => ({ color: alpha(tokens.foreground, 0.1), borderless: false }),
};

// ---------- iOS (HIG / SF): inset card-like surface, flat, SF tracking ----------
export const iosSkin: StatsSkin = {
  cardSurface: (tokens: ColorTokens): ViewStyle => ({
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 18,
    // iOS inset-grouped surfaces read flat (no drop shadow).
  }),
  plainContainer: (tokens: ColorTokens): ViewStyle => ({
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 22,
  }),
  rowGap: { card: { gap: 12 }, plain: { gap: 22 } },
  title: (tokens: ColorTokens, surface: Surface): TextStyle =>
    surface === "card"
      ? { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: -0.2, color: tokens.foreground, marginBottom: 12 }
      : { fontSize: 16, lineHeight: 24, fontWeight: "600", letterSpacing: -0.3, color: tokens.foreground, marginBottom: 16 },
  labelText: (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, letterSpacing: -0.2, color: tokens["muted-foreground"] }),
  valueText: (tokens: ColorTokens): TextStyle => ({
    marginTop: 4,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "600",
    letterSpacing: -0.5,
    color: tokens.foreground,
  }),
  deltaBase: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: -0.1 },
  pressedOpacity: 0.8,
  ripple: null,
};

// ---------- Android (Material 3): outlined card, flat, M3 tracking, ripple ----------
export const androidSkin: StatsSkin = {
  cardSurface: (tokens: ColorTokens): ViewStyle => ({
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 16,
    // M3 outlined cards are flat (no elevation).
  }),
  plainContainer: (tokens: ColorTokens): ViewStyle => ({
    borderRadius: 12,
    borderWidth: 1,
    borderColor: tokens.border,
    backgroundColor: tokens.card,
    padding: 24,
  }),
  rowGap: { card: { gap: 12 }, plain: { gap: 24 } },
  title: (tokens: ColorTokens, surface: Surface): TextStyle =>
    surface === "card"
      ? { fontSize: 14, lineHeight: 20, fontWeight: "600", letterSpacing: 0.1, color: tokens.foreground, marginBottom: 12 }
      : { fontSize: 16, lineHeight: 24, fontWeight: "600", letterSpacing: 0.15, color: tokens.foreground, marginBottom: 16 },
  labelText: (tokens: ColorTokens): TextStyle => ({ fontSize: 14, lineHeight: 20, letterSpacing: 0.1, color: tokens["muted-foreground"] }),
  valueText: (tokens: ColorTokens): TextStyle => ({
    marginTop: 4,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: "600",
    letterSpacing: 0,
    color: tokens.foreground,
  }),
  deltaBase: { marginTop: 4, fontSize: 12, lineHeight: 16, fontWeight: "500", letterSpacing: 0.1 },
  pressedOpacity: null,
  ripple: (tokens) => ({ color: alpha(tokens.foreground, 0.1), borderless: false }),
};
