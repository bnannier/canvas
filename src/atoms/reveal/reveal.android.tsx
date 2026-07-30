import { createReveal } from "./reveal.shared.js";
import { androidSkin } from "./reveal.styles.js";

// Material 3 Reveal. Metro resolves this file on Android; the docs import it for
// preview. Shared treatment: M3 describes entering elements only in general motion
// terms (a short offset plus a fade on a decelerating curve, which is this), with no
// distinct scroll-into-view component, so this matches the web movement.
export const Reveal = createReveal(androidSkin);
export type { RevealProps } from "./reveal.shared.js";
