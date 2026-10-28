import { Badge } from "../badge/badge.js";
import { sectionDescription, sectionRow, sectionActions } from "./typography.styles.js";
import { identityTextInk } from "../../style/identity-text.js";
import { useViewportWidth } from "../../style/responsive.js";
import { fluidRoles, fluidType } from "../../style/type-scale.js";
import { type ReactNode } from "react";
import { type AccessibilityRole, type GestureResponderEvent } from "react-native";
import { View, Text, useHugStyle, useTheme, MONO_FONT, type StyleProp, type TextStyle, innerFill, tabularNums } from "../../style/index.js";
import {
  type Role,
  type Tone,
  type Weight,
  type Leading,
  type Decoration,
  type Numerals,
  roleColor,
  toneColor,
  weightStyle,
  leadingStyle,
  decorationStyle,
  MONO_ROLES,
} from "./typography.styles.js";

// Shared Typography shell. The structure (a single styled Text), the role axis
// and its first-match precedence, the token-backed color resolution, and the
// monospace handling all live here once; a platform file supplies only its skin
// (the per-role type scale, a TypographySkin) and calls createTypography.
//
// Typography is a "Shared" platform treatment: there is no native type-scale
// control to match per OS (iOS text styles, Material 3 type roles, and the web
// scale all map onto the same Canvas tokens), so iosSkin / androidSkin reference
// the exact same values as webSkin. The full per-OS file structure still exists
// so the atom matches the kit's platform-skin recipe, but the columns are
// identical and it is not registered for a docs preview.
//
// Typography is the Canvas type scale as a single styled Text. One boolean role
// prop per style (display / h1..h5 / lead / body / small / tiny / muted /
// caption / code / mono) selects a token-backed style set; omit all for the
// plain body look. The foundation's `Text` primitive is the host element, so the
// public component is named `Typography` (the bare `Text` name belongs to the
// foundation).
//
// Boolean-prop API: one boolean per role on a single axis, first-match
// precedence (mirrors Button's intentOf / Badge's toneOf). Roles are mutually
// exclusive; pass at most one. Orthogonal axes layer on top: an optional tone
// (subtle / primary / destructive / success / warning) sets the color, a weight
// (regular / medium / semibold / bold) sets the fontWeight, a leading (tightLeading)
// tightens the line box, a decoration (underline) sets textDecorationLine, and the
// numerals (tabular) give every digit the same width; each is mutually exclusive
// within itself and null by default, so the role's own color, weight, line box,
// undecorated look and proportional figures stand when the axis is untouched. The
// text content comes from children.
//
// Two roles want a monospace face (code, mono). There is no font-family
// utility, so each requests RN's cross-platform monospace alias via inline
// style, the same pattern Badge's `mono` modifier uses. The docs set `code` at
// text-[13px]; the type scale resolves only token sizes, so it falls back to the
// nearest one (text-sm), as Kbd does for its 11px label.

export interface TypographyProps {
  /** A section heading owning its count, metadata and trailing actions. */
  section?: boolean;
  count?: number | string;
  description?: string;
  actions?: ReactNode;
  /** Exact Argus reading roles; these preserve the original dense web type. */
  subheading?: boolean;
  label?: boolean;
  micro?: boolean;
  tag?: boolean;
  eyebrow?: boolean;
  eyebrowLg?: boolean;
  stageLabel?: boolean;
  statValue?: boolean;
  metricValue?: boolean;
  formValue?: boolean;
  extraBold?: boolean;
  uppercase?: boolean;
  foreground?: boolean;
  inverse?: boolean;
  action?: boolean;
  actionForeground?: boolean;
  info?: boolean;
  /** Hue-keyed stage text; deep in light schemes, pastel in dark. */
  hue?: number;
  /** De-emphasized white ink over branded surfaces. */
  inverseHint?: boolean;
  inverseSubtle?: boolean;
  inverseMuted?: boolean;
  inverseSoft?: boolean;
  inverseFaint?: boolean;
  right?: boolean;
  center?: boolean;
  numberOfLines?: number;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  /**
   * The heading level assistive tech hears, independent of the visual role: a heading
   * role exposes its own level (display and h1 at 1, h2 to h5 at 2 to 5) unless this
   * overrides it, so `<Typography h3 level={2}>` draws the h3 size and is announced as
   * a level-2 heading (a real `<h2>` on the web). On a non-heading role it makes the
   * text a heading at that level. Semantics only: it never changes the look. `href`
   * still wins (a link is not a heading).
   */
  level?: HeadingLevel;
  displayLeading?: boolean;
  singleLeading?: boolean;
  lockupLeading?: boolean;
  denseLeading?: boolean;
  compactLeading?: boolean;
  labelLeading?: boolean;
  captionLeading?: boolean;
  smallLeading?: boolean;
  strongLeading?: boolean;
  bodyLeading?: boolean;
  relaxedLeading?: boolean;
  displayTracking?: boolean;
  tightTracking?: boolean;
  referenceTracking?: boolean;
  labelTracking?: boolean;
  eyebrowTracking?: boolean;
  wideTracking?: boolean;
  expandedTracking?: boolean;

  children?: ReactNode;
  // Role (pick one; default is the plain body style). First-match precedence.
  /**
   * The hand-off's hero headline: the display face sized by the window,
   * `clamp(56px, 7.2vw, 112px)` at a .94 line and -.045em tracking (56 px on a phone, 103.68
   * at a 1440 window, 112 from 1556 up). One per page, its lead line. A level-1 heading.
   */
  hero?: boolean;
  /**
   * The hand-off's page title (a component page's name): the display face sized by the
   * window, `clamp(40px, 5vw, 64px)` at a 1.0 line and -.04em tracking. A level-1 heading.
   */
  pageTitle?: boolean;
  /** A page section's heading (a component page's Playground, Variants...): the display face, 500 28/1.1, -.02em. A level-2 heading. */
  sectionTitle?: boolean;
  /** A feature card's title: the display face, 500 22/1.15, -.02em. A level-3 heading. */
  cardTitle?: boolean;
  /** A panel's or dialog's title: the display face, 500 20/1.2, -.02em. */
  panelTitle?: boolean;
  /** The one-line tagline under a section's title: the display face, 400 22/1.3, -.015em, in the foreground ink. */
  tagline?: boolean;
  /** A page's summary under its title: 400 18/1.55 in the secondary ink. */
  pageLead?: boolean;
  /** A section's introductory paragraph: 400 17/1.55 in the secondary ink. */
  sectionLead?: boolean;
  /** A feature card's description: 400 14/1.55 in the secondary ink. */
  cardBody?: boolean;
  /** The note under a page section's heading: 400 14/1.5 in the secondary ink. */
  sectionNote?: boolean;
  display?: boolean;
  h1?: boolean;
  h2?: boolean;
  h3?: boolean;
  h4?: boolean;
  h5?: boolean;
  lead?: boolean;
  body?: boolean;
  small?: boolean;
  tiny?: boolean;
  muted?: boolean;
  caption?: boolean;
  code?: boolean;
  mono?: boolean;
  // Tone (pick one; orthogonal to role). When omitted, the role's own color is used.
  subtle?: boolean;
  primary?: boolean;
  destructive?: boolean;
  success?: boolean;
  warning?: boolean;
  // Weight (pick one; orthogonal to role). When omitted, the role's own weight is used.
  regular?: boolean;
  medium?: boolean;
  semibold?: boolean;
  bold?: boolean;
  /**
   * Leading (orthogonal to role). Pulls the line box in to 1.25x the font size for a
   * STACKED LOCKUP, where two lines read as one unit (a wordmark over its tagline, a
   * title over its subtitle) and the roles reading leading would leave dead air between
   * them. Only ever tightens, so it is safe on every role. Omit for prose: the role's
   * own line height is the reading value.
   */
  tightLeading?: boolean;
  /**
   * Decoration (orthogonal to role / tone / weight). Underlines the text so an inline
   * text link reads as a link, replacing the banned raw `textDecorationLine` style
   * shim. Combines freely with every role, tone, and weight; omit for undecorated text.
   */
  underline?: boolean;
  /**
   * Numerals (orthogonal to role / tone / weight). Tabular figures: every digit the same
   * width, for numbers read down a column or updated in place (a table's figures, a live
   * metric, a counter), so the column lines up and a changing value holds still. Never
   * for prose, which keeps the face's own proportional figures.
   */
  tabular?: boolean;
  /**
   * Renders this text as a REAL inline link on the web: react-native-web
   * gives the root element a browser link with this destination, so
   * middle-click, cmd-click, and open-in-new-tab work and assistive tech
   * hears a link. Native platforms have no browser links and ignore it, so
   * pair `href` with an `onPress` running the same navigation through the
   * host's router. Combine with `underline` for the conventional link look.
   * When a heading role and `href` are both set, the link role wins.
   */
  href?: string;
  /** Attributes forwarded with `href` on the web: `target`, `rel`, `download`. */
  hrefAttrs?: { target?: "_blank" | "_self"; rel?: string; download?: boolean | string };
  /** Press handler; the native navigation path for `href` (fires on web too). */
  onPress?: (event: GestureResponderEvent) => void;
  /** E2E hook forwarded to the root element. */
  testID?: string;
  /**
   * For layout/positioning composition only (margins handled by Row/Column). Not a
   * styling escape hatch: size, color, and weight come from the props above.
   */
  style?: StyleProp<TextStyle>;
}

// The only thing a platform skin owns: the per-role type scale (size /
// line-height / weight / tracking and the `code` pill box), color-free. The
// shell layers the token-backed color on top. For the Shared treatment all
// three platform skins carry the same record.
export interface TypographySkin {
  roleType: Record<Role, TextStyle>;
}

export function textAlignOf(p: TypographyProps) {
  if (p.right) return "right";
  if (p.center) return "center";
  return null;
}

/** A heading level, 1 (the page title) to 6, as `aria-level` spells it. */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * The heading level a Typography exposes: the explicit `level` when one is passed, else
 * its heading role's own level, else 6 for a `section` heading, else none (plain text).
 */
export function headingLevelOf(p: TypographyProps, role: Role = roleOf(p)): number | undefined {
  return p.level ?? HEADING_LEVEL[role] ?? (p.section ? 6 : undefined);
}

// Heading roles and the level they expose to assistive tech. Setting
// accessibilityRole="header" gives the native heading trait and (via RNW) emits
// a real <h*> element; aria-level pins the correct level (display + h1 at 1,
// h2..h5 at 2..5, or the explicit `level`) rather than RNW defaulting every
// heading to h1. Non-heading roles are absent here so
// they stay plain text.
const HEADING_LEVEL: Partial<Record<Role, number>> = {
  hero: 1,
  pageTitle: 1,
  sectionTitle: 2,
  cardTitle: 3,
  display: 1,
  h1: 1,
  h2: 2,
  h3: 3,
  h4: 4,
  h5: 5,
};

// Role precedence when more than one is passed: first match wins. Order runs
// largest-to-smallest, headings before helper styles, so a conflicting pair
// resolves to the more prominent role.
export function roleOf(p: TypographyProps): Role {
  if (p.subheading) return "subheading";
  if (p.label) return "label";
  if (p.micro) return "micro";
  if (p.tag) return "tag";
  if (p.eyebrow) return "eyebrow";
  if (p.eyebrowLg) return "eyebrowLg";
  if (p.stageLabel) return "stageLabel";
  if (p.statValue) return "statValue";
  if (p.metricValue) return "metricValue";
  if (p.formValue) return "formValue";

  if (p.hero) return "hero";
  if (p.pageTitle) return "pageTitle";
  if (p.sectionTitle) return "sectionTitle";
  if (p.cardTitle) return "cardTitle";
  if (p.panelTitle) return "panelTitle";
  if (p.tagline) return "tagline";
  if (p.pageLead) return "pageLead";
  if (p.sectionLead) return "sectionLead";
  if (p.cardBody) return "cardBody";
  if (p.sectionNote) return "sectionNote";
  if (p.display) return "display";
  if (p.h1) return "h1";
  if (p.h2) return "h2";
  if (p.h3) return "h3";
  if (p.h4) return "h4";
  if (p.h5) return "h5";
  if (p.code) return "code";
  // A reading size passed with `mono` keeps its size and takes the mono face
  // (`<Typography caption mono>` is the 12 px mono caption); `mono` alone is its own role.
  if (p.lead) return "lead";
  if (p.caption) return "caption";
  if (p.small) return "small";
  if (p.tiny) return "tiny";
  if (p.body) return "body";
  if (p.mono) return "mono";
  if (p.muted) return "muted";
  return "body";
}

// Tone precedence when more than one is passed: first match wins. Returns null
// when no tone prop is set, so the role's own color stands.
export function toneOf(p: TypographyProps): Tone | null {
  if (p.destructive) return "destructive";
  if (p.warning) return "warning";
  if (p.success) return "success";
  if (p.primary) return "primary";
  if (p.subtle) return "subtle";
  // `muted` is also a role; as a tone it layers muted color onto a larger role
  // (e.g. `lead muted`). Bare `<Typography muted>` still resolves the muted role,
  // which paints the same color, so this stays backward-compatible.
  if (p.muted) return "muted";
  return null;
}

// Weight precedence when more than one is passed: first match wins. Returns null
// when no weight prop is set, so the role's own weight stands.
export function weightOf(p: TypographyProps): Weight | null {
  if (p.extraBold) return "extraBold";
  if (p.bold) return "bold";
  if (p.semibold) return "semibold";
  if (p.medium) return "medium";
  if (p.regular) return "regular";
  return null;
}

// Leading: a single-value axis today, so there is no precedence to resolve. Returns
// null when the prop is absent, so the role's own line height stands.
export function leadingOf(p: TypographyProps): Leading | null {
  if (p.displayLeading) return "display";
  if (p.singleLeading) return "single";
  if (p.lockupLeading) return "lockup";
  if (p.denseLeading) return "dense";
  if (p.compactLeading) return "compact";
  if (p.labelLeading) return "label";
  if (p.captionLeading) return "caption";
  if (p.smallLeading) return "small";
  if (p.strongLeading) return "strong";
  if (p.bodyLeading) return "body";
  if (p.relaxedLeading) return "relaxed";

  if (p.tightLeading) return "tight";
  return null;
}

// Decoration: a single-value axis today, so there is no precedence to resolve. Returns
// null when the prop is absent, so the text keeps the role's own undecorated look.
export function decorationOf(p: TypographyProps): Decoration | null {
  if (p.underline) return "underline";
  return null;
}

// Numerals: a single-value axis today, so there is no precedence to resolve. Returns
// null when the prop is absent, so the face's own proportional figures stand.
export function numeralsOf(p: TypographyProps): Numerals | null {
  if (p.tabular) return "tabular";
  return null;
}

/** Build a Typography component from a platform skin. */
export function createTypography(skin: TypographySkin) {
  return function Typography(props: TypographyProps) {
    const { children, testID, style } = props;
    const theme = useTheme();
    const { tokens, dark } = theme;
    const role = roleOf(props);
    // A fluid headline follows the window's width (the hand-off's vw clamp); every other
    // role holds no window subscription.
    const fluid = role === "hero" || role === "pageTitle" ? role : null;
    const viewportWidth = useViewportWidth(fluid != null);
    const roleType: TextStyle = fluid ? { ...skin.roleType[role], ...fluidType(fluidRoles[fluid], viewportWidth) } : skin.roleType[role];
    const tone = toneOf(props);
    const weight = weightOf(props);
    const textAlign = textAlignOf(props);
    const leading = leadingOf(props);
    const decoration = decorationOf(props);
    const numerals = numeralsOf(props);

    // The mono/code roles ask for a monospace face; there is no font-family
    // utility, so request the cross-platform monospace alias via inline style.
    const monoStyle = MONO_ROLES.has(role) || props.mono ? { fontFamily: MONO_FONT } : null;
    // The code pill is HUG (a boxed inline token); every other role is a text run that
    // spans its parent and wraps.
    const hug = useHugStyle();
    const codeHug = role === "code" ? hug : null;

    // Heading roles expose the native heading trait + level so screen readers
    // can navigate heading-by-heading (the H key / rotor); body/helper roles
    // stay plain text. aria-level + accessibilityLevel pin the level on web and
    // native (otherwise RNW emits every header as h1).
    // An explicit `level` decouples the announced level from the visual role.
    const level = headingLevelOf(props, role);

    // A real browser link on the web (react-native-web renders Text carrying
    // `href` as one); native ignores these and navigates through onPress. RN's
    // prop types don't know the web-forwarded props, hence the narrow spread.
    const anchor = props.href != null ? { href: props.href, hrefAttrs: props.hrefAttrs } : null;

    const label = (
      <Text
        {...(anchor ?? undefined)}
        testID={testID}
        onPress={props.onPress}
        numberOfLines={props.numberOfLines}
        ellipsizeMode="tail"
        accessibilityLabel={props.accessibilityLabel}
        accessibilityRole={anchor ? "link" : props.accessibilityRole ?? (level ? "header" : undefined)}
        aria-level={anchor ? undefined : level}
        style={[
          roleType,
          roleColor(tokens, role),
          props.foreground ? { color: tokens.foreground } : null,
          props.inverse ? { color: "#ffffff" } : null,
          props.action ? { color: tokens.action ?? tokens.primary } : null,
          props.actionForeground ? { color: tokens["action-foreground"] ?? "#ffffff" } : null,
          props.info ? { color: tokens.info ?? tokens.primary } : null,
          props.hue != null ? { color: identityTextInk(props.hue, dark) } : null,
          props.inverseHint ? { color: "rgba(255,255,255,0.9)" } : null,
          props.inverseSubtle ? { color: "rgba(255,255,255,0.8)" } : null,
          props.inverseMuted ? { color: "rgba(255,255,255,0.78)" } : null,
          props.inverseSoft ? { color: "rgba(255,255,255,0.75)" } : null,
          props.inverseFaint ? { color: "rgba(255,255,255,0.72)" } : null,
          textAlign ? { textAlign } : null,
          props.uppercase ? { textTransform: "uppercase" } : null,
          props.displayTracking ? { letterSpacing: Number(roleType.fontSize) * -0.02 } : null,
          props.tightTracking ? { letterSpacing: Number(roleType.fontSize) * -0.01 } : null,
          props.referenceTracking ? { letterSpacing: Number(roleType.fontSize) * 0.04 } : null,
          props.labelTracking ? { letterSpacing: Number(roleType.fontSize) * 0.06 } : null,
          props.eyebrowTracking ? { letterSpacing: Number(roleType.fontSize) * 0.14 } : null,
          props.wideTracking ? { letterSpacing: Number(roleType.fontSize) * 0.16 } : null,
          props.expandedTracking ? { letterSpacing: Number(roleType.fontSize) * 0.18 } : null,
          // The code pill is a Text node, which cannot host a material sibling, so under
          // glass its `muted` fill becomes an ink tint that lets the pane it sits on show
          // through (the same translucent emphasis a glass table's header band takes).
          role === "code" ? { backgroundColor: innerFill(theme, "muted", "soft") } : null,
          tone ? toneColor(tokens, dark, tone) : null,
          weight ? weightStyle(weight) : null,
          // After the role, whose line height it overrides; the skin's own scale is the
          // input it clamps against, so this reads the active platform's value.
          leading ? leadingStyle(roleType, leading) : null,
          // Decoration is orthogonal to color/weight/leading (it sets textDecorationLine),
          // so its placement in the cascade is free; it layers on before the escape hatch.
          decoration ? decorationStyle(decoration) : null,
          // Figure width only (no size, colour or weight), so its place in the cascade is
          // free too; the kit's one spelling of tabular figures per platform.
          numerals === "tabular" ? tabularNums() : null,
          monoStyle,
          codeHug,
          style,
        ]}
      >
        {children}
      </Text>
    );
    if (props.section) return <View style={sectionRow}>
      {label}
      {props.count === undefined ? null : <Badge count start>{String(props.count)}</Badge>}
      {props.description ? <Text style={sectionDescription(tokens, role === "subheading")}>{props.description}</Text> : null}
      {props.actions ? <View style={sectionActions}>{props.actions}</View> : null}
    </View>;
    return label;
  };
}
