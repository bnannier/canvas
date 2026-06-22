import { createCarousel } from "./carousel.shared.js";
import { webSkin } from "./carousel.styles.js";

// Web Carousel (the base; Metro falls back to it on native, web bundlers resolve it).
export const Carousel = createCarousel(webSkin);
export type { CarouselProps } from "./carousel.shared.js";
