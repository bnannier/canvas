import { type ReactNode } from "react";
import { cn } from "../cn.js";
import { Box, Text } from "../engine/index.js";

// A bordered banner that surfaces an inline notification: a leading icon glyph,
// a bold title, and a description. Configured by a tone axis (info / success /
// warning / error, plus a neutral default), and an optional `icon` glyph.
//
// Boolean-prop API: one boolean per tone, first-match precedence within the
// axis (mirrors Button's intentOf / Badge's statusOf). Each tone is theme-aware:
// a soft 50/200 surface with a 600/700/800 type ramp in light mode, and a
// 950/800 surface with a 200/300/400 ramp in dark mode (via the dark: variant).
// The neutral default uses the semantic card / border / foreground tokens.

export interface AlertProps {
  // Content.
  title?: string;
  description?: string;
  // A leading glyph (a single Text character; the engine has no icon set).
  icon?: ReactNode;
  // Tone (pick one; omit for the neutral default).
  info?: boolean;
  success?: boolean;
  warning?: boolean;
  error?: boolean;
  children?: ReactNode;
  className?: string;
}

type Tone = "info" | "success" | "warning" | "error" | "neutral";

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: AlertProps): Tone {
  if (p.error) return "error";
  if (p.warning) return "warning";
  if (p.success) return "success";
  if (p.info) return "info";
  return "neutral";
}

const ALERT_BASE = "flex-row items-start gap-3 rounded-lg border px-4 py-3";

const CONTAINER: Record<Tone, string> = {
  info: "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
  success: "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
  warning: "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950",
  error: "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950",
  neutral: "border-border bg-card",
};

const ICON: Record<Tone, string> = {
  info: "text-blue-600 dark:text-blue-400",
  success: "text-green-600 dark:text-green-400",
  warning: "text-amber-600 dark:text-amber-400",
  error: "text-red-600 dark:text-red-400",
  neutral: "text-muted-foreground",
};

const TITLE: Record<Tone, string> = {
  info: "text-blue-800 dark:text-blue-200",
  success: "text-green-800 dark:text-green-200",
  warning: "text-amber-800 dark:text-amber-200",
  error: "text-red-800 dark:text-red-200",
  neutral: "text-foreground",
};

const BODY: Record<Tone, string> = {
  info: "text-blue-700 dark:text-blue-300",
  success: "text-green-700 dark:text-green-300",
  warning: "text-amber-700 dark:text-amber-300",
  error: "text-red-700 dark:text-red-300",
  neutral: "text-muted-foreground",
};

export function Alert(props: AlertProps) {
  const { title, description, icon, children, className } = props;
  const tone = toneOf(props);

  return (
    <Box className={cn(ALERT_BASE, CONTAINER[tone], className)}>
      {icon != null ? (
        <Text className={cn("text-base leading-5", ICON[tone])}>{icon}</Text>
      ) : null}
      <Box className="flex-1 gap-1">
        {title != null && title !== "" ? (
          <Text className={cn("text-sm font-semibold", TITLE[tone])}>{title}</Text>
        ) : null}
        {description != null && description !== "" ? (
          <Text className={cn("text-sm", BODY[tone])}>{description}</Text>
        ) : null}
        {children}
      </Box>
    </Box>
  );
}
