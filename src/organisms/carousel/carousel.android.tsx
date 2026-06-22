import { createCarousel } from "./carousel.shared.js";
import { androidSkin } from "./carousel.styles.js";

// Material 3 Carousel. Metro resolves this on Android.
export const Carousel = createCarousel(androidSkin);
export type { CarouselProps } from "./carousel.shared.js";
