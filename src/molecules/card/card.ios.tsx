import { createCard, createCardMedia, createCardTitle } from "./card.shared.js";
import { iosSkin } from "./card.styles.js";

// iOS (HIG) Card. Metro resolves this file on iOS; the docs import it for preview.
// iOS has no card control, so its card is the web look at the hand-off's iOS card
// corner: 12pt with Apple's continuous (superellipse) corner curve.
export const Card = createCard(iosSkin);

// The full-bleed cover slot nests inside the 12pt continuous corner, so it is
// skin-parameterized rather than static.
export const CardMedia = createCardMedia(iosSkin);

// The title takes the skin's face (the display face on the web, the platform face natively).
export const CardTitle = createCardTitle(iosSkin);

// The composition subcomponents are static + shared, re-exported here so the full
// public API exists on iOS.
export {
  CardHeader,
  CardDescription,
  CardContent,
  CardFooter,
  CardSeparator,
} from "./card.shared.js";
export type { CardProps, CardSectionProps, CardTextProps, CardMediaProps } from "./card.shared.js";
