import { createSwatch } from "./swatch.shared.js";
import { iosSkin } from "./swatch.styles.js";

// Swatch on iOS: no platform ships a color sample control, so the skin is the web's (whose
// continuous corner curve iOS draws). Metro resolves this file on iOS. Display-only, so
// there is no press feedback to skin here.
export const Swatch = createSwatch(iosSkin);
export type { SwatchProps } from "./swatch.shared.js";
