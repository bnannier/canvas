import { createCarousel } from "./carousel.shared.js";
import { iosSkin } from "./carousel.styles.js";

// iOS Carousel. Metro resolves this on iOS.
export const Carousel = createCarousel(iosSkin);
export type { CarouselProps } from "./carousel.shared.js";
