import { createEmblem } from "./emblem.shared.js";
import { webSkin } from "./emblem.styles.js";

// Web Emblem (the base; Metro falls back to it on native, web bundlers resolve it).
/** A tinted rounded square or circle holding one icon or a short monogram. */
export const Emblem = createEmblem(webSkin);
export type { EmblemProps } from "./emblem.shared.js";
