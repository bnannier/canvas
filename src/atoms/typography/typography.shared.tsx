import { type ReactNode } from "react";
import { Text, useTheme, type StyleProp, type TextStyle } from "../../style/index.js";
import { type Role, roleColor, MONO_ROLES } from "./typography.styles.js";

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
// prop per style (display / h1..h5 / body / small / tiny / muted / caption /
// code / mono) selects a token-backed style set; omit all for the plain body
// look. The foundation's `Text` primitive is the host element, so the public
// component is named `Typography` (the bare `Text` name belongs to the
// foundation).
//
// Boolean-prop API: one boolean per role on a single axis, first-match
// precedence (mirrors Button's intentOf / Badge's toneOf). Roles are mutually
// exclusive; pass at most one. The text content comes from children.
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
  body?: boolean;
  small?: boolean;
  tiny?: boolean;
  muted?: boolean;
  caption?: boolean;
  code?: boolean;
  mono?: boolean;
  /** Escape hatch for layout/positioning composition (margins, alignment). */
  style?: StyleProp<TextStyle>;
}

// The only thing a platform skin owns: the per-role type scale (size /
// line-height / weight / tracking and the `code` pill box), color-free. The
// shell layers the token-backed color on top. For the Shared treatment all
// three platform skins carry the same record.
export interface TypographySkin {
  roleType: Record<Role, TextStyle>;
}

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
  if (p.code) return "code";
  if (p.mono) return "mono";
  if (p.caption) return "caption";
  if (p.muted) return "muted";
  if (p.small) return "small";
  if (p.tiny) return "tiny";
  if (p.body) return "body";
  return "body";
}

/** Build a Typography component from a platform skin. */
export function createTypography(skin: TypographySkin) {
  return function Typography(props: TypographyProps) {
    const { children, style } = props;
    const { tokens } = useTheme();
    const role = roleOf(props);

    // The mono/code roles ask for a monospace face; there is no font-family
    // utility, so request the cross-platform monospace alias via inline style.
    const monoStyle = MONO_ROLES.has(role) ? { fontFamily: "monospace" as const } : null;

    return (
      <Text style={[skin.roleType[role], roleColor(tokens, role), monoStyle, style]}>
        {children}
      </Text>
    );
  };
}
