import { createSwatch } from "./swatch.shared.js";
import { androidSkin } from "./swatch.styles.js";

// Material 3 Swatch: the M3 container radius ladder and M3 label tracking. Metro
// resolves this file on Android. Display-only, so there is no ripple to skin here.
export const Swatch = createSwatch(androidSkin);
export type { SwatchProps } from "./swatch.shared.js";
