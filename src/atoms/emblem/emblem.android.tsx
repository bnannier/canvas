import { createEmblem } from "./emblem.shared.js";
import { androidSkin } from "./emblem.styles.js";

// Emblem on Android: no platform ships an icon tile, so the skin is the web's. Metro
// resolves this file on Android.
export const Emblem = createEmblem(androidSkin);
export type { EmblemProps } from "./emblem.shared.js";
