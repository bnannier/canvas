import { createCard, createCardMedia } from "./card.shared.js";
import { androidSkin } from "./card.styles.js";

// Material 3 Card. Metro resolves this file on Android; the docs import it for
// preview. Matches M3 cards, where outline and elevation are mutually exclusive:
// the default card is the M3 ELEVATED card (level-1 / 1dp elevation, no visible
// outline), `flat` is the M3 OUTLINED card (1dp outline, elevation 0), `raised`
// lifts to M3 level 3 (6dp). Plus the 12dp medium shape, tighter M3 density
// steps, and android_ripple on the interactive (onPress) surface (in the shell).
export const Card = createCard(androidSkin);

// The full-bleed cover slot nests inside the M3 12dp medium-shape corner, so it is
// skin-parameterized rather than static.
export const CardMedia = createCardMedia(androidSkin);

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
export type { CardProps, CardSectionProps, CardTextProps, CardMediaProps } from "./card.shared.js";
