import { type ColorTokens } from "../../style/index.js";

// Co-located Spinner styles. The spinner is an RN ActivityIndicator, so its only
// styling is the arc color (a semantic token, scheme-aware) and the numeric
// diameter. The component reads the active booleans, resolves one value per axis
// by precedence, and feeds these into the indicator's `color`/`size` props.

export type Tone = "primary" | "muted" | "foreground";

// Arc color token per tone: the indicator's `color`. Reads from the active brand
// tokens (via useTheme) so it follows light/dark and the glass surface.
export const TONE_TOKEN: Record<Tone, keyof ColorTokens> = {
  primary: "primary",
  muted: "muted-foreground",
  foreground: "foreground",
};
