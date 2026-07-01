import { type ReactNode } from "react";
import { Text, useTheme, type StyleProp, type TextStyle } from "../../style/index.js";
import { type Role, type Tone, type Weight, roleColor, toneColor, weightStyle, MONO_ROLES } from "./typography.styles.js";

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
// exclusive; pass at most one. Two orthogonal axes layer on top: an optional
// tone (subtle / primary / destructive / positive / warning) sets the color and
// a weight (regular / medium / semibold / bold) sets the fontWeight; each is
// mutually exclusive within itself and null by default, so the role's own color
// and weight stand when the axis is untouched. The text content comes from
// children.
//
// Two roles want a monospace face (code, mono). There is no font-family
// utility, so each requests RN's cross-platform monospace alias via inline
// style, the same pattern Badge's `mono` modifier uses. The docs set `code` at
// text-[13px]; the type scale resolves only token sizes, so it falls back to the
// nearest one (text-sm), as Kbd does for its 11px label.

export interface TypographyProps {
  children?: ReactNode;
  // Role (pick one; default is the plain body style). First-match precedence.
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
  positive?: boolean;
  warning?: boolean;
  // Weight (pick one; orthogonal to role). When omitted, the role's own weight is used.
  regular?: boolean;
  medium?: boolean;
  semibold?: boolean;
  bold?: boolean;
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

// Heading roles and the level they expose to assistive tech. Setting
// accessibilityRole="header" gives the native heading trait and (via RNW) emits
// a real <h*> element; passing both aria-level and accessibilityLevel pins the
// correct level (display + h1 at 1, h2..h5 at 2..5) on web and native rather
// than RNW defaulting every heading to h1. Non-heading roles are absent here so
// they stay plain text.
const HEADING_LEVEL: Partial<Record<Role, number>> = {
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
function roleOf(p: TypographyProps): Role {
  if (p.display) return "display";
  if (p.h1) return "h1";
  if (p.h2) return "h2";
  if (p.h3) return "h3";
  if (p.h4) return "h4";
  if (p.h5) return "h5";
  if (p.lead) return "lead";
  if (p.code) return "code";
  if (p.mono) return "mono";
  if (p.caption) return "caption";
  if (p.muted) return "muted";
  if (p.small) return "small";
  if (p.tiny) return "tiny";
  if (p.body) return "body";
  return "body";
}

// Tone precedence when more than one is passed: first match wins. Returns null
// when no tone prop is set, so the role's own color stands.
function toneOf(p: TypographyProps): Tone | null {
  if (p.destructive) return "destructive";
  if (p.warning) return "warning";
  if (p.positive) return "positive";
  if (p.primary) return "primary";
  if (p.subtle) return "subtle";
  return null;
}

// Weight precedence when more than one is passed: first match wins. Returns null
// when no weight prop is set, so the role's own weight stands.
function weightOf(p: TypographyProps): Weight | null {
  if (p.bold) return "bold";
  if (p.semibold) return "semibold";
  if (p.medium) return "medium";
  if (p.regular) return "regular";
  return null;
}

/** Build a Typography component from a platform skin. */
export function createTypography(skin: TypographySkin) {
  return function Typography(props: TypographyProps) {
    const { children, style } = props;
    const { tokens, dark } = useTheme();
    const role = roleOf(props);
    const tone = toneOf(props);
    const weight = weightOf(props);

    // The mono/code roles ask for a monospace face; there is no font-family
    // utility, so request the cross-platform monospace alias via inline style.
    const monoStyle = MONO_ROLES.has(role) ? { fontFamily: "monospace" as const } : null;

    // Heading roles expose the native heading trait + level so screen readers
    // can navigate heading-by-heading (the H key / rotor); body/helper roles
    // stay plain text. aria-level + accessibilityLevel pin the level on web and
    // native (otherwise RNW emits every header as h1).
    const level = HEADING_LEVEL[role];

    return (
      <Text
        accessibilityRole={level ? "header" : undefined}
        aria-level={level}
        style={[
          skin.roleType[role],
          roleColor(tokens, role),
          tone ? toneColor(tokens, dark, tone) : null,
          weight ? weightStyle(weight) : null,
          monoStyle,
          style,
        ]}
      >
        {children}
      </Text>
    );
  };
}
