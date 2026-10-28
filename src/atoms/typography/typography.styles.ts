import { destructiveText } from "../../style/destructive-text.js";
import { primaryText } from "../../style/primary-text.js";
import { type TextStyle } from "react-native";
import { type ColorTokens } from "../../style/index.js";
import { fluidRoles, fluidType, typeRoles } from "../../style/type-scale.js";
import { DISPLAY_FONT } from "../../style/mono.js";
import { platformShape } from "../../style/platform-shape.js";
import { type TypographySkin } from "./typography.shared.js";

// Co-located Typography styles. One axis (role), each role mapping to a single
// TextStyle built from the active brand tokens (so the type color follows
// light/dark and the glass surface). The component resolves the active role by
// first-match precedence and spreads the matching fragment.
//
// Typography is a "Shared" platform treatment: there is no native type-scale
// control to skin per OS, so the three skins are one.
//
// Every fragment is a TextStyle: Typography renders a single Text, so layout +
// type + color all live on the Text. The `code` role additionally carries the
// muted fill and pill padding (a Text can hold backgroundColor/padding in RN).
// The role color and the monospace role set are platform-neutral, so they live
// here and are consumed by the shared shell, not the per-OS skins.

export type Role =
  | "subheading"
  | "label"
  | "micro"
  | "tag"
  | "eyebrow"
  | "eyebrowLg"
  | "stageLabel"
  | "statValue"
  | "metricValue"
  | "formValue"

  | "hero"
  | "pageTitle"
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

// Type + layout per role, color-free (the parts that don't read a token). Every role is
// the v4 hand-off's (src/style/type-scale.ts `typeRoles`, from its Typography renderer):
// the display and h1 to h4 titles are medium-weight Bricolage with tightened tracking,
// h5 and the subheading are the 17px UI title, body is 15/1.55 regular, lead 19, small
// 13, tiny 11 and caption 12, the eyebrow 11px mono tracked +0.1em. The legacy roles map
// onto the scale: label and formValue are the UI label and body, micro the tiny step,
// tag the tier tag (mono, at the 10px floor), eyebrowLg and stageLabel the eyebrow,
// statValue and metricValue the 32px and h4 display numbers. `code` and `mono` are the
// mono face at the small size, and `code` carries the pill box (radius + padding).
const roleTypeOf = (display: TextStyle): Record<Role, TextStyle> => {
  const d = (style: TextStyle): TextStyle => ({ ...style, ...display });
  return {
    subheading: typeRoles.subheading,
    label: typeRoles.label,
    micro: { ...typeRoles.tiny, fontWeight: "500" },
    tag: typeRoles.tag,
    eyebrow: typeRoles.eyebrow,
    // The hand-off's hero eyebrow (its Library page): the eyebrow a step up, 500 12px/1 mono
    // tracked .1em.
    eyebrowLg: { ...typeRoles.eyebrow, fontSize: 12, lineHeight: 12, letterSpacing: 1.2 },
    stageLabel: typeRoles.eyebrow,
    statValue: d(typeRoles.statValue),
    metricValue: d(typeRoles.h4),
    formValue: { ...typeRoles.body, fontWeight: "500" },

    // The fluid headlines at their minimum; the shell sizes them by the window
    // (fluidRoles in src/style/type-scale.ts).
    hero: d(fluidType(fluidRoles.hero, 0)),
    pageTitle: d(fluidType(fluidRoles.pageTitle, 0)),
    display: d(typeRoles.display),
    h1: d(typeRoles.h1),
    h2: d(typeRoles.h2),
    h3: d(typeRoles.h3),
    h4: d(typeRoles.h4),
    h5: typeRoles.h5,
    lead: typeRoles.lead,
    body: typeRoles.body,
    small: typeRoles.small,
    tiny: typeRoles.tiny,
    muted: typeRoles.small,
    caption: typeRoles.caption,
    // A muted pill (the fill is added in roleColor). The pill is HUG: the shell appends
    // `useHugStyle()` for this role instead of a static alignSelf, so it keeps its content
    // width in a Column without pinning a Row child.
    code: { ...typeRoles.mono, borderRadius: platformShape.web.key, paddingHorizontal: 6, paddingVertical: 2 },
    mono: typeRoles.mono,
  };
};

// One scale on every platform: Typography is a Shared treatment with no native type-scale
// control to diverge toward. The titles and big numbers ask for the display face
// (DISPLAY_FONT), which the themed Text swaps for the app's registered `display` face and
// otherwise leaves the platform's system face, so the face is the app's registration, not
// a per-platform skin.
export const webSkin: TypographySkin = { roleType: roleTypeOf({ fontFamily: DISPLAY_FONT }) };
export const iosSkin: TypographySkin = webSkin;
export const androidSkin: TypographySkin = webSkin;

// Text color (and the `code` role's fill) per role. RN text does not cascade, so every
// role names its color token explicitly, as the hand-off's renderer does: the eyebrow in
// the accent text, the label and the muted role in the secondary ink, the caption in the
// tertiary ink, everything else in `foreground`.
export function roleColor(tokens: ColorTokens, role: Role): TextStyle {
  switch (role) {
    case "label":
      return { color: tokens["muted-foreground"] };
    case "eyebrow":
    case "eyebrowLg":
    case "stageLabel":
      return { color: primaryText(tokens) };
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
      return { color: tokens.foreground, backgroundColor: tokens.secondary };
    case "muted":
      return { color: tokens["muted-foreground"] };
    case "caption":
      return { color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
    default: return { color: tokens.foreground };
  }
}

// Roles whose face is monospace; RN has no font-family utility, so the component
// supplies the cross-platform monospace alias inline (matches Badge's mono).
export const MONO_ROLES = new Set<Role>(["code", "mono", "eyebrow", "eyebrowLg", "stageLabel", "tag"]);

// Tone axis: an orthogonal color layer over the role's own color. Its names are
// deliberately collision-free with the roles (so `muted`/`small`/`tiny`/`caption`
// keep their existing muted color as roles, and tone adds the colored intents).
// When no tone prop is set the role's own color stands. success/warning read the
// semantic success/warning tokens (scheme-aware); subtle is a translucent foreground.
export type Tone = "muted" | "subtle" | "primary" | "destructive" | "success" | "warning";

export function toneColor(tokens: ColorTokens, dark: boolean, tone: Tone): TextStyle {
  switch (tone) {
    // The hand-off's Typography has one dimmed tone, `muted`, in its third ink (`--tx3`);
    // `subtle` is the second ink (`--tx2`) its pages give secondary copy (a hero's lead and
    // eyebrow).
    case "muted":
      return { color: tokens["subtle-foreground"] ?? tokens["muted-foreground"] };
    case "subtle":
      return { color: tokens["muted-foreground"] };
    case "primary":
      return { color: primaryText(tokens) };
    case "destructive":
      return { color: destructiveText(tokens) };
    case "success":
      return { color: tokens["success-text"] ?? tokens.success };
    case "warning":
      return { color: tokens["warning-text"] ?? tokens.warning };
  }
}

// Weight axis: an orthogonal fontWeight layer over the role's own weight. When no
// weight prop is set the role's own weight stands.
export type Weight = "extraBold" | "regular" | "medium" | "semibold" | "bold";

const WEIGHT: Record<Weight, TextStyle["fontWeight"]> = {
  extraBold: "800",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
};

export function weightStyle(weight: Weight): TextStyle {
  return { fontWeight: WEIGHT[weight] };
}

// Leading axis: an orthogonal line-height layer over the role's own line box. When
// no leading prop is set the role's line height stands.
//
// Why the axis exists: the roles bake a reading line height (`lead` 14/21, `tiny`
// 11/15), which is right for prose and too airy for a STACKED LOCKUP, where two lines
// read as one unit (a wordmark over its tagline, a title over its subtitle). There the
// half-leading of both lines lands between them: 4px under a `lead` line plus 2px over
// a `tiny` one is 6px of dead air that no gap prop can remove, because a Column's gap
// only adds. Since `lineHeight` at a call site is a banned restyle, the tightening has
// to be a semantic prop, so it is one.
export type Leading = "tight" | "display" | "single" | "lockup" | "dense" | "compact" | "label" | "caption" | "small" | "strong" | "body" | "relaxed";
const EXACT_LEADING: Record<Exclude<Leading,"tight">,number> = {"display": 1.1, "single": 1, "lockup": 1.15, "dense": 1.2, "compact": 1.25, "label": 1.3, "caption": 1.35, "small": 1.4, "strong": 1.45, "body": 1.5, "relaxed": 1.55};

// Cap ratio for `tight`: a line box 1.25x the font size. Chosen as the tightest value
// that still clears Latin descenders + diacritics at every role's size (a 16px line at
// 20px leaves 4px, which "design system"'s g/y need), so it never clips.
const TIGHT_RATIO = 1.25;

// `tight` only ever TIGHTENS: the result is the role's own line height or the capped
// one, whichever is smaller. Without the min, the ratio would LOOSEN the roles whose
// line boxes are already at or below 1.25 (display 56/56 = 1, h1 44/47 = 1.07, h3
// 26/30 = 1.15), so `<Typography display tightLeading>` would silently grow its line
// box to 70. The clamp makes the prop safe on every role, which is what lets it be a
// free-standing axis rather than one that is only valid on some roles.
export function leadingStyle(roleType: TextStyle, leading: Leading): TextStyle | null {
  const fontSize = roleType.fontSize;
  const current = roleType.lineHeight;
  if (typeof fontSize !== "number" || typeof current !== "number") return null;
  if (leading !== "tight") return { lineHeight: Math.round(fontSize * EXACT_LEADING[leading] * 100) / 100 };
  const lineHeight = Math.min(current, Math.round(fontSize * (leading === "tight" ? TIGHT_RATIO : 1)));
  return lineHeight === current ? null : { lineHeight };
}

// Decoration axis: an orthogonal text-decoration layer over the role. A single value
// today (underline), so there is no precedence to resolve. It marks an inline text
// link so a link reads as a link without the banned raw `textDecorationLine` style
// shim; when the prop is absent the text carries no decoration. Underline is a Shared
// treatment like the type scale: iOS, Material 3, and the web all underline an inline
// link the same way, so there is nothing to diverge per OS.
export type Decoration = "underline";

export function decorationStyle(decoration: Decoration): TextStyle {
  return { textDecorationLine: decoration };
}

// Numerals axis: an orthogonal figure-width layer over the role. A single value today
// (tabular), so there is no precedence to resolve. Tabular figures give every digit the
// same width, so a column of numbers lines up and a value that updates in place (a live
// metric, a counter, a countdown) holds still as its digits change; the hand-off sets
// its numbers that way. When the prop is absent the face's own proportional figures,
// right for prose, stand. The style itself is the kit's one spelling of tabular figures
// per platform (src/style/numerals.ts: React Native's font variant natively, the CSS
// property on the web, where react-native-web drops the native spelling), so this shell
// carries no platform branch.
export type Numerals = "tabular";


/** A heading and its count/metadata wrap on a shared baseline. */
export const sectionRow: import("react-native").ViewStyle = { flexDirection: "row", gap: 10, alignItems: "baseline", flexWrap: "wrap" };
export const sectionActions: import("react-native").ViewStyle = { marginLeft: "auto" };
export const sectionDescription = (tokens: ColorTokens, compact: boolean): TextStyle => ({
  fontSize: compact ? 11.5 : 12, lineHeight: compact ? 16.1 : 16.8,
  fontWeight: compact ? "600" : "500", color: tokens["muted-foreground"], flexShrink: 1,
});
