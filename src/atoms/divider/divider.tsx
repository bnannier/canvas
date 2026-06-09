import { type ReactNode } from "react";
import { cn } from "../../cn.js";
import { View, Text } from "../../engine/index.js";

export interface DividerProps {
  /**
   * Optional middle content. With children, a horizontal divider renders a
   * flanking-line + centered-label row (the "with label" / "with action"
   * patterns). A string renders as muted label text; arbitrary nodes (e.g. a
   * button) render as-is for the action pattern. Ignored when `vertical`.
   */
  children?: ReactNode;
  // Orientation (pick one; default is horizontal).
  horizontal?: boolean;
  vertical?: boolean;
  // Emphasis (pick one; default tracks the border token).
  soft?: boolean;
  strong?: boolean;
  className?: string;
}

type Orientation = "horizontal" | "vertical";
type Emphasis = "soft" | "strong";

// First match wins when more than one orientation flag is passed.
function orientationOf(p: DividerProps): Orientation {
  if (p.vertical) return "vertical";
  return "horizontal";
}

// First match wins when more than one emphasis flag is passed.
function emphasisOf(p: DividerProps): Emphasis {
  if (p.soft) return "soft";
  return "strong";
}

// The hairline fill color, token-backed. `strong` is the standard border;
// `soft` steps down to the muted token for a quieter rule.
const RULE_BG: Record<Emphasis, string> = {
  strong: "bg-border",
  soft: "bg-muted",
};

export function Divider(props: DividerProps) {
  const { children, className } = props;
  const orientation = orientationOf(props);
  const emphasis = emphasisOf(props);
  const ruleBg = RULE_BG[emphasis];

  if (orientation === "vertical") {
    // A thin vertical rule that adapts to the row height it sits in.
    return <View className={cn("w-px self-stretch", ruleBg, className)} />;
  }

  // Horizontal with a label/action in the middle: a centered node flanked by
  // two hairlines (the sepLabel pattern: gap-3, xs muted text).
  if (children != null) {
    const isText = typeof children === "string" || typeof children === "number";
    return (
      <View className={cn("flex-row items-center gap-3", className)}>
        <View className={cn("h-px flex-1", ruleBg)} />
        {isText ? (
          <Text className="text-xs text-muted-foreground">{children}</Text>
        ) : (
          children
        )}
        <View className={cn("h-px flex-1", ruleBg)} />
      </View>
    );
  }

  // Plain horizontal hairline spanning the full width.
  return <View className={cn("h-px w-full", ruleBg, className)} />;
}
