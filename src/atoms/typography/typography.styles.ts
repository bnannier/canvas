import { type TextStyle } from "react-native";
import { alpha, palette, type ColorTokens } from "../../style/index.js";
import { type TypographySkin } from "./typography.shared.js";

// Co-located Typography styles. One axis (role), each role mapping to a single
// TextStyle built from the active brand tokens (so the type color follows
// light/dark and the glass surface). The component resolves the active role by
// first-match precedence and spreads the matching fragment.
//
// Typography is a "Shared" platform treatment: there is no native type-scale
// control to skin per OS, so iosSkin and androidSkin reference the exact same
// values as webSkin (the kit type scale already maps cleanly onto iOS text
// styles and Material 3 type roles via the shared tokens). The full file
// structure exists to match the kit's platform-skin recipe; the columns are
// identical and the atom is not registered for a docs preview.
//
// Every fragment is a TextStyle: Typography renders a single Text, so layout +
// type + color all live on the Text. The `code` role additionally carries the
// muted fill and pill padding (a Text can hold backgroundColor/padding in RN).
// The role color and the monospace role set are platform-neutral, so they live
// here and are consumed by the shared shell, not the per-OS skins.

export type Role =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "lead"
  | "body"
  | "small"
  | "tiny"
  | "muted"
  | "caption"
  | "code"
  | "mono";

// Type + layout per role, color-free (the parts that don't read a token).
// Mirrors the docs' typeScale: heading sizes get the tight tracking, body gets
// the relaxed line height, caption gets uppercase + wide tracking, and `code`
// carries the self-start pill box (radius + padding).
const roleType: Record<Role, TextStyle> = {
  // text-5xl font-bold tracking-tight
  display: { fontSize: 48, lineHeight: 48, fontWeight: "700", letterSpacing: -0.4 },
  // text-4xl font-bold tracking-tight
  h1: { fontSize: 36, lineHeight: 40, fontWeight: "700", letterSpacing: -0.4 },
  // text-3xl font-semibold tracking-tight
  h2: { fontSize: 30, lineHeight: 36, fontWeight: "600", letterSpacing: -0.4 },
  // text-2xl font-semibold tracking-tight
  h3: { fontSize: 24, lineHeight: 32, fontWeight: "600", letterSpacing: -0.4 },
  // text-xl font-semibold tracking-tight
  h4: { fontSize: 20, lineHeight: 28, fontWeight: "600", letterSpacing: -0.4 },
  // text-lg font-semibold
  h5: { fontSize: 18, lineHeight: 28, fontWeight: "600" },
  // text-base: a 16px lead paragraph / identity name (weight comes from the weight axis)
  lead: { fontSize: 16, lineHeight: 24 },
  // text-sm leading-relaxed (the relaxed line height overrides text-sm's 20)
  body: { fontSize: 14, lineHeight: 28 },
  // text-sm
  small: { fontSize: 14, lineHeight: 20 },
  // text-xs
  tiny: { fontSize: 12, lineHeight: 16 },
  // text-sm
  muted: { fontSize: 14, lineHeight: 20 },
  // text-xs uppercase tracking-wide
  caption: { fontSize: 12, lineHeight: 16, textTransform: "uppercase", letterSpacing: 0.4 },
  // self-start rounded bg-muted px-1.5 py-0.5 text-sm (fill added in roleColor)
  code: {
    alignSelf: "flex-start",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontSize: 14,
    lineHeight: 20,
  },
  // text-sm
  mono: { fontSize: 14, lineHeight: 20 },
};

// Web base skin: the established Canvas type scale (the current look, preserved
// verbatim).
export const webSkin: TypographySkin = { roleType };

// iOS (HIG) and Material 3 skins. Typography is a Shared treatment, so both
// reference the exact same scale as the web skin: there is no native type-scale
// control to diverge toward, and the kit's type tokens already serve iOS text
// styles and Material 3 type roles. Keeping them identical is intentional, not
// a placeholder.
export const iosSkin: TypographySkin = webSkin;
export const androidSkin: TypographySkin = webSkin;

// Text color (and the `code` role's muted fill) per role. The docs relied on
// inherited page color; RN text does not cascade, so every role names its color
// token explicitly: headings/body/code/mono on `foreground`, the helper styles
// on `muted-foreground`.
export function roleColor(tokens: ColorTokens, role: Role): TextStyle {
  switch (role) {
    case "display":
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "lead":
    case "body":
    case "mono":
      return { color: tokens.foreground };
    case "code":
      return { color: tokens.foreground, backgroundColor: tokens.muted };
    case "small":
    case "tiny":
    case "muted":
    case "caption":
      return { color: tokens["muted-foreground"] };
  }
}

// Roles whose face is monospace; RN has no font-family utility, so the component
// supplies the cross-platform monospace alias inline (matches Badge's mono).
export const MONO_ROLES = new Set<Role>(["code", "mono"]);

// Tone axis: an orthogonal color layer over the role's own color. Its names are
// deliberately collision-free with the roles (so `muted`/`small`/`tiny`/`caption`
// keep their existing muted color as roles, and tone adds the colored intents).
// When no tone prop is set the role's own color stands. positive/warning pick a
// palette step per scheme (like Badge); subtle is a translucent foreground.
export type Tone = "muted" | "subtle" | "primary" | "destructive" | "positive" | "warning";

export function toneColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  switch (tone) {
    case "muted":
      return { color: tokens["muted-foreground"] };
    case "subtle":
      return { color: alpha(tokens.foreground, 0.6) };
    case "primary":
      return { color: tokens.primary };
    case "destructive":
      return { color: tokens.destructive };
    case "positive":
      return { color: dark ? palette["green-400"] : palette["green-600"] };
    case "warning":
      return { color: dark ? palette["amber-400"] : palette["amber-600"] };
  }
}

// Weight axis: an orthogonal fontWeight layer over the role's own weight. When no
// weight prop is set the role's own weight stands.
export type Weight = "regular" | "medium" | "semibold" | "bold";

const WEIGHT: Record<Weight, TextStyle["fontWeight"]> = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export function weightStyle(weight: Weight): TextStyle {
  return { fontWeight: WEIGHT[weight] };
}
