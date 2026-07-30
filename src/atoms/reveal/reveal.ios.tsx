import { createReveal } from "./reveal.shared.js";
import { iosSkin } from "./reveal.styles.js";

// iOS (HIG) Reveal. Metro resolves this file on iOS; the docs import it for preview.
// Shared treatment: the HIG specifies no scroll-into-view entrance for content, so
// this matches the web movement.
export const Reveal = createReveal(iosSkin);
export type { RevealProps } from "./reveal.shared.js";
