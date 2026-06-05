import { ActivityIndicator } from "react-native";
import { useTheme, type ColorTokens } from "../engine/index.js";

export interface SpinnerProps {
  // Size (pick one; default sits between small and large).
  small?: boolean;
  large?: boolean;
  // Tone (pick one; default is the foreground arc color).
  primary?: boolean;
  muted?: boolean;
  foreground?: boolean;
  /** Accessible description of what is loading. */
  accessibilityLabel?: string;
}

type Tone = "primary" | "muted" | "foreground";

// Tone precedence when more than one is passed: first match wins.
function toneOf(p: SpinnerProps): Tone {
  if (p.primary) return "primary";
  if (p.muted) return "muted";
  if (p.foreground) return "foreground";
  return "foreground";
}

const TONE_TOKEN: Record<Tone, keyof ColorTokens> = {
  primary: "primary",
  muted: "muted-foreground",
  foreground: "foreground",
};

// Native ActivityIndicator size is two-step; the default size maps to "small".
function sizeOf(p: SpinnerProps): "small" | "large" {
  if (p.large) return "large";
  return "small";
}

export function Spinner(props: SpinnerProps) {
  const { accessibilityLabel } = props;
  const { tokens } = useTheme();
  const tone = toneOf(props);

  return (
    <ActivityIndicator
      size={sizeOf(props)}
      color={tokens[TONE_TOKEN[tone]]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? "Loading"}
    />
  );
}
