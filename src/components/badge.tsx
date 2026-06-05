import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";

// Two families of badge.
//
// 1. The metadata badge: a rectangular pill (rounded-md) for static labels like
//    schema, role, or tag. Configured by a tone axis (default / secondary /
//    outline / destructive) plus a `mono` modifier for token / event names.
// 2. The status badge (`status`): a fully rounded pill carrying a leading dot,
//    for live state like active / pending / failed. Configured by a status-tone
//    axis (success / warning / error / info / neutral).
//
// Boolean-prop API: one boolean per option, grouped by axis, first-match
// precedence within an axis (mirrors Button's intentOf). The `status` boolean
// switches families; the status-tone booleans only apply in that family.

export interface BadgeProps {
  children?: ReactNode;
  // Family: metadata badge (default) vs. status badge (with a dot).
  status?: boolean;
  // Metadata tone (pick one; default is the solid primary fill).
  default?: boolean;
  secondary?: boolean;
  outline?: boolean;
  destructive?: boolean;
  // Metadata modifier: monospace face for tokens, scopes, event names.
  mono?: boolean;
  // Status tone (pick one; only applies when `status`).
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  info?: boolean;
  neutral?: boolean;
  className?: string;
}

type Tone = "default" | "secondary" | "outline" | "destructive";
type Status = "success" | "warning" | "error" | "info" | "neutral";

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: BadgeProps): Tone {
  if (p.default) return "default";
  if (p.destructive) return "destructive";
  if (p.secondary) return "secondary";
  if (p.outline) return "outline";
  return "secondary";
}

function statusOf(p: BadgeProps): Status {
  if (p.success) return "success";
  if (p.error) return "error";
  if (p.warning) return "warning";
  if (p.info) return "info";
  if (p.neutral) return "neutral";
  return "neutral";
}

// Metadata badge: rounded-md pill, bordered, xs medium type.
const BADGE_BASE = "flex-row items-center self-start rounded-md border px-2 py-0.5";
const BADGE_CONTAINER: Record<Tone, string> = {
  default: "border-transparent bg-primary",
  secondary: "border-transparent bg-secondary",
  outline: "border-border bg-transparent",
  destructive: "border-transparent bg-destructive",
};
const BADGE_LABEL: Record<Tone, string> = {
  default: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  outline: "text-foreground",
  destructive: "text-destructive-foreground",
};

// Status badge: fully rounded pill with a leading dot, soft tinted surface.
// The engine ships only Canvas's semantic tokens (no hue scale), so each tone
// maps to the nearest token-backed surface: error -> destructive, neutral ->
// muted, and the remaining tones to a soft accent surface differentiated by the
// dot color.
const STATUS_BASE = "flex-row items-center self-start gap-1.5 rounded-full border px-2 py-0.5";
const STATUS_CONTAINER: Record<Status, string> = {
  success: "border-border bg-accent",
  warning: "border-border bg-accent",
  error: "border-destructive/20 bg-destructive/10",
  info: "border-border bg-accent",
  neutral: "border-border bg-muted",
};
const STATUS_LABEL: Record<Status, string> = {
  success: "text-foreground",
  warning: "text-foreground",
  error: "text-destructive",
  info: "text-foreground",
  neutral: "text-muted-foreground",
};
const STATUS_DOT: Record<Status, string> = {
  success: "bg-primary",
  warning: "bg-foreground",
  error: "bg-destructive",
  info: "bg-primary",
  neutral: "bg-muted-foreground",
};

export function Badge(props: BadgeProps) {
  const { children, mono, className } = props;
  const labelType = "text-xs font-medium";

  if (props.status) {
    const tone = statusOf(props);
    const container = cn(STATUS_BASE, STATUS_CONTAINER[tone], className);
    const label = cn(labelType, STATUS_LABEL[tone]);
    return (
      <Box className={container}>
        <Box className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[tone])} />
        {children != null ? <Text className={label}>{children}</Text> : null}
      </Box>
    );
  }

  const tone = toneOf(props);
  const container = cn(BADGE_BASE, BADGE_CONTAINER[tone], className);
  const label = cn(labelType, BADGE_LABEL[tone]);
  // The mono modifier asks for a monospace face; the engine has no font-family
  // utility, so request RN's cross-platform monospace alias via inline style.
  const monoStyle = mono ? { fontFamily: "monospace" } : undefined;

  return (
    <Box className={container}>
      {children != null ? (
        <Text className={label} style={monoStyle}>
          {children}
        </Text>
      ) : null}
    </Box>
  );
}
