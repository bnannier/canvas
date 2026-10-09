import { createEmblem } from "./emblem.shared.js";
import { iosSkin } from "./emblem.styles.js";

// Emblem on iOS: no platform ships an icon tile, so the skin is the web's (whose continuous
// corner curve iOS draws). Metro resolves this file on iOS.
export const Emblem = createEmblem(iosSkin);
export type { EmblemProps } from "./emblem.shared.js";
