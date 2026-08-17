import { createSwatch } from "./swatch.shared.js";
import { iosSkin } from "./swatch.styles.js";

// iOS (HIG) Swatch: the continuous superellipse corner curve and the tighter HIG label
// tracking. Metro resolves this file on iOS. Display-only, so there is no press
// feedback to skin here.
export const Swatch = createSwatch(iosSkin);
export type { SwatchProps } from "./swatch.shared.js";
