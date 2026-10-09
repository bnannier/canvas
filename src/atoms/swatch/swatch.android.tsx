import { createSwatch } from "./swatch.shared.js";
import { androidSkin } from "./swatch.styles.js";

// Swatch on Android: no platform ships a color sample control, so the skin is the web's.
// Metro resolves this file on Android. Display-only, so there is no ripple to skin here.
export const Swatch = createSwatch(androidSkin);
export type { SwatchProps } from "./swatch.shared.js";
