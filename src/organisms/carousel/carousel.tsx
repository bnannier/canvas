import { createCarousel } from "./carousel.shared.js";
import { webSkin } from "./carousel.styles.js";

// Web Carousel (the base; Metro falls back to it on native, web bundlers resolve it).
/** A horizontally paged slide viewer with snap paging, dot indicators and optional arrows. */
export const Carousel = createCarousel(webSkin);
export type { CarouselProps } from "./carousel.shared.js";
