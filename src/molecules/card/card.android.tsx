import { createCard } from "./card.shared.js";
import { androidSkin } from "./card.styles.js";

// Material 3 Card. Metro resolves this file on Android; the docs import it for
// preview. Matches M3 cards: the 12dp medium shape, tighter M3 density steps, M3
// resting elevation (level 1 / shadow-sm, raised lifts to level 3 / shadow-md),
// and android_ripple on the interactive (onPress) surface (handled in the shell).
export const Card = createCard(androidSkin);

// The composition subcomponents are static + shared, re-exported here so the full
// public API exists on Android.
export {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSeparator,
} from "./card.shared.js";
export type { CardProps, CardSectionProps, CardTextProps } from "./card.shared.js";
