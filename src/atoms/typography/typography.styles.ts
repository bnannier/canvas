import { type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";

// Co-located Typography styles. One axis (role), each role mapping to a single
// TextStyle built from the active brand tokens (so the type color follows
// light/dark and the glass surface). The component resolves the active role by
// first-match precedence and spreads the matching fragment.
//
// Every fragment is a TextStyle: Typography renders a single Text, so layout +
// type + color all live on the Text. The `code` role additionally carries the
// muted fill and pill padding (a Text can hold backgroundColor/padding in RN).

export type Role =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
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
export const roleType: Record<Role, TextStyle> = {
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
