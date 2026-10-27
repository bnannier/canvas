import { createCard, createCardMedia, createCardTitle } from "./card.shared.js";
import { webSkin } from "./card.styles.js";

// Web Card (the base; Metro falls back to it on native, web bundlers resolve it).
// The v4 hand-off's panel: the 16px card corner, a hairline and the small resting shadow.
/**
 * A content surface, flat, default or raised, compact or comfortable; compose it from
 * CardHeader, CardContent and CardFooter or bring your own structure.
 */
export const Card = createCard(webSkin);

// The full-bleed cover slot nests inside the card's corner, so it is skin-parameterized.
/** A full-bleed image slot at the edge of a Card, clipped to the card's corners. */
export const CardMedia = createCardMedia(webSkin);

// The title takes the skin's face (the display face on the web, the platform face natively).
/** A Card's heading: 500 weight, tight tracking, in the card foreground. */
export const CardTitle = createCardTitle(webSkin);

// The composition subcomponents are static + shared, re-exported from every
// platform wrapper so the full public API exists on each.
export {
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
  CardSeparator,
} from "./card.shared.js";
export type { CardProps, CardSectionProps, CardTextProps, CardMediaProps } from "./card.shared.js";
