import { createCard, createCardMedia } from "./card.shared.js";
import { webSkin } from "./card.styles.js";

// Web Card (the base; Metro falls back to it on native, web bundlers resolve it).
// Keeps the current, established Canvas card look: 8px radius, soft resting shadow.
/**
 * A content surface, flat, default or raised, compact or comfortable; compose it from
 * CardHeader, CardContent and CardFooter or bring your own structure.
 */
export const Card = createCard(webSkin);

// The full-bleed cover slot nests inside the card's corner, so it is skin-parameterized.
/** A full-bleed image slot at the edge of a Card, clipped to the card's corners. */
export const CardMedia = createCardMedia(webSkin);

// The composition subcomponents are static + shared, re-exported from every
// platform wrapper so the full public API exists on each.
export {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSeparator,
} from "./card.shared.js";
export type { CardProps, CardSectionProps, CardTextProps, CardMediaProps } from "./card.shared.js";
