import { type ReactNode } from "react";
import { cn } from "../../cn.js";
import { Text } from "../../engine/index.js";

// Typography: the Canvas type scale as a single styled Text. One boolean role
// prop per style (display / h1..h5 / body / small / tiny / muted / caption /
// code / mono) selects a token-backed class set; omit all for the plain body
// look. The engine's `Text` primitive is the host element, so the public
// component is named `Typography` (the bare `Text` name belongs to the engine).
//
// Boolean-prop API: one boolean per role on a single axis, first-match
// precedence (mirrors Button's intentOf / Badge's toneOf). Roles are mutually
// exclusive; pass at most one. The text content comes from children.
//
// Two roles want a monospace face (code, mono). The engine ships no font-family
// utility, so each requests RN's cross-platform monospace alias via inline
// style, the same pattern Badge's `mono` modifier uses. The docs set `code` at
// text-[13px]; the engine resolves only token sizes, so it falls back to the
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
  className?: string;
}

type Role =
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

// Token-backed class set per role. Mirrors the docs' typeScale, with explicit
// text-foreground where the docs relied on inherited page color (RN text does
// not cascade), and font-mono dropped in favor of the inline style below.
const ROLE_CLASS: Record<Role, string> = {
  display: "text-5xl font-bold tracking-tight text-foreground",
  h1: "text-4xl font-bold tracking-tight text-foreground",
  h2: "text-3xl font-semibold tracking-tight text-foreground",
  h3: "text-2xl font-semibold tracking-tight text-foreground",
  h4: "text-xl font-semibold tracking-tight text-foreground",
  h5: "text-lg font-semibold text-foreground",
  body: "text-sm leading-relaxed text-foreground",
  small: "text-sm text-muted-foreground",
  tiny: "text-xs text-muted-foreground",
  muted: "text-sm text-muted-foreground",
  caption: "text-xs uppercase tracking-wide text-muted-foreground",
  code: "self-start rounded bg-muted px-1.5 py-0.5 text-sm text-foreground",
  mono: "text-sm text-foreground",
};

// Roles whose face is monospace; the engine has no font-family utility, so
// supply RN's cross-platform alias inline (matches Badge's mono modifier).
const MONO_ROLES = new Set<Role>(["code", "mono"]);

export function Typography(props: TypographyProps) {
  const { children, className } = props;
  const role = roleOf(props);
  const label = cn(ROLE_CLASS[role], className);
  const monoStyle = MONO_ROLES.has(role) ? { fontFamily: "monospace" } : undefined;

  return (
    <Text className={label} style={monoStyle}>
      {children}
    </Text>
  );
}
