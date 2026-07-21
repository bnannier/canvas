import { createCard, createCardMedia } from "./card.shared.js";
import { webSkin } from "./card.styles.js";

// Web Card (the base; Metro falls back to it on native, web bundlers resolve it).
// Keeps the current, established Canvas card look: 8px radius, soft resting shadow.
export const Card = createCard(webSkin);

// The full-bleed cover slot nests inside the card's corner, so it is skin-parameterized.
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
