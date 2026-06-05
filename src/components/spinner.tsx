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

// Three distinct diameters (px) so each size axis value renders a different
// arc; ActivityIndicator accepts a numeric size on native and RN-Web.
// Precedence within the size axis: large > small > default (first match wins).
function sizeOf(p: SpinnerProps): number {
  if (p.large) return 32;
  if (p.small) return 16;
  return 20;
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
