import { type ReactNode } from "react";
import { ActivityIndicator, type GestureResponderEvent } from "react-native";
import { cn } from "../../cn.js";
import { Pressable, Text, useTheme, type ColorTokens } from "../../engine/index.js";

export interface ButtonProps {
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  // Intent (pick one; default is the primary action).
  primary?: boolean;
  secondary?: boolean;
  destructive?: boolean;
  outline?: boolean;
  ghost?: boolean;
  link?: boolean;
  // Size (pick one).
  small?: boolean;
  large?: boolean;
  icon?: boolean;
  // Layout and state.
  block?: boolean;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

type Intent = "primary" | "secondary" | "destructive" | "outline" | "ghost" | "link";

// Intent precedence when more than one is passed: first match wins.
function intentOf(p: ButtonProps): Intent {
  if (p.primary) return "primary";
  if (p.destructive) return "destructive";
  if (p.secondary) return "secondary";
  if (p.outline) return "outline";
  if (p.ghost) return "ghost";
  if (p.link) return "link";
  return "primary";
}

const CONTAINER_INTENT: Record<Intent, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  destructive: "bg-destructive",
  outline: "border border-input bg-transparent",
  ghost: "bg-transparent",
  link: "bg-transparent",
};

const LABEL_INTENT: Record<Intent, string> = {
  primary: "text-primary-foreground",
  secondary: "text-secondary-foreground",
  destructive: "text-destructive-foreground",
  outline: "text-foreground",
  ghost: "text-foreground",
  link: "text-primary underline",
};

const FG_TOKEN: Record<Intent, keyof ColorTokens> = {
  primary: "primary-foreground",
  secondary: "secondary-foreground",
  destructive: "destructive-foreground",
  outline: "foreground",
  ghost: "foreground",
  link: "primary",
};

function sizeContainer(p: ButtonProps): string {
  if (p.icon) return p.small ? "w-8 h-8" : p.large ? "w-12 h-12" : "w-10 h-10";
  if (p.small) return "px-3 py-1.5";
  if (p.large) return "px-6 py-3";
  return "px-4 py-2";
}

function sizeLabel(p: ButtonProps): string {
  if (p.large) return "text-base";
  if (p.small) return "text-xs";
  return "text-sm";
}

export function Button(props: ButtonProps) {
  const { children, onPress, loading, disabled, block, className } = props;
  const intent = intentOf(props);
  const { tokens } = useTheme();

  const container = cn(
    "flex-row items-center justify-center gap-2 rounded-md active:opacity-90",
    sizeContainer(props),
    CONTAINER_INTENT[intent],
    block && "w-full",
    (disabled || loading) && "opacity-50",
    className,
  );
  const label = cn("font-medium", sizeLabel(props), LABEL_INTENT[intent]);

  return (
    <Pressable
      className={container}
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
    >
      {loading ? <ActivityIndicator size="small" color={tokens[FG_TOKEN[intent]]} /> : null}
      {children != null ? <Text className={label}>{children}</Text> : null}
    </Pressable>
  );
}
