import { type ReactNode } from "react";
import { cn } from "../../cn.js";
import { View, Text } from "../../engine/index.js";

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

// Status badge: fully rounded pill with a leading dot and a soft tinted surface.
// Each tone uses the engine's Tailwind palette: a soft 50/200/700 surface in
// light mode and a 950/800/400 surface in dark mode (neutral stays on the
// semantic muted token), with a saturated 500 dot.
const STATUS_BASE = "flex-row items-center self-start gap-1.5 rounded-full border px-2 py-0.5";
const STATUS_CONTAINER: Record<Status, string> = {
  success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
  neutral: "border-border bg-muted",
};
const STATUS_LABEL: Record<Status, string> = {
  success: "text-green-700 dark:text-green-400",
  warning: "text-amber-700 dark:text-amber-400",
  error: "text-red-700 dark:text-red-400",
  info: "text-blue-700 dark:text-blue-400",
  neutral: "text-muted-foreground",
};
const STATUS_DOT: Record<Status, string> = {
  success: "bg-green-500",
  warning: "bg-amber-500",
  error: "bg-red-500",
  info: "bg-blue-500",
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
      <View className={container}>
        <View className={cn("h-1.5 w-1.5 rounded-full", STATUS_DOT[tone])} />
        {children != null ? <Text className={label}>{children}</Text> : null}
      </View>
    );
  }

  const tone = toneOf(props);
  const container = cn(BADGE_BASE, BADGE_CONTAINER[tone], className);
  const label = cn(labelType, BADGE_LABEL[tone]);
  // The mono modifier asks for a monospace face; the engine has no font-family
  // utility, so request RN's cross-platform monospace alias via inline style.
  const monoStyle = mono ? { fontFamily: "monospace" } : undefined;

  return (
    <View className={container}>
      {children != null ? (
        <Text className={label} style={monoStyle}>
          {children}
        </Text>
      ) : null}
    </View>
  );
}
