import { createCard, createCardMedia } from "./card.shared.js";
import { iosSkin } from "./card.styles.js";

// iOS (HIG) Card. Metro resolves this file on iOS; the docs import it for preview.
// iOS has no card control, so the structure is kept and only iOS touches apply: a
// 12pt radius with Apple's continuous (superellipse) corner curve and a flat
// resting surface (native grouped surfaces are flat; `raised` still lifts).
export const Card = createCard(iosSkin);

// The full-bleed cover slot nests inside the 12pt continuous corner, so it is
// skin-parameterized rather than static.
export const CardMedia = createCardMedia(iosSkin);

// The composition subcomponents are static + shared, re-exported here so the full
// public API exists on iOS.
export {
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSeparator,
} from "./card.shared.js";
export type { CardProps, CardSectionProps, CardTextProps, CardMediaProps } from "./card.shared.js";
