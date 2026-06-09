import { type ReactNode } from "react";
import { cn } from "../../cn.js";
import { View, Text } from "../../engine/index.js";

// Kbd: a keyboard shortcut indicator. Renders a single key cap, a small
// bordered, slightly raised label with monospace-ish small text. The key label
// comes from children. One cap = one key; compose multiple Kbd caps with a
// separator for a chord (e.g. ⌘ + K), per the docs.
//
// The documented cap has one fixed look (no size or intent variants), so there
// are no boolean axes to map: the markup mirrors the docs' kbdCls exactly,
// minus the two utilities the engine cannot resolve (font-mono has no RN font
// utility, and text-[11px] falls back to the nearest token size, text-xs).
export interface KbdProps {
  children?: ReactNode;
  className?: string;
}

export function Kbd({ children, className }: KbdProps) {
  const container = cn(
    "flex-row h-5 min-w-[20px] items-center justify-center rounded border border-border bg-muted px-1.5",
    className,
  );
  const label = "text-xs font-medium text-muted-foreground";

  return (
    <View className={container}>
      {children != null ? <Text className={label}>{children}</Text> : null}
    </View>
  );
}
