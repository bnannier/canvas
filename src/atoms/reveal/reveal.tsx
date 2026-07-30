import { createReveal } from "./reveal.shared.js";
import { webSkin } from "./reveal.styles.js";

// Web Reveal (the base; Metro falls back to it on native, web bundlers resolve it).
// Reveal is a "Shared" treatment, so iOS and Android play this same entrance.
export const Reveal = createReveal(webSkin);
export type { RevealProps } from "./reveal.shared.js";
