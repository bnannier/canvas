import { createEmblem } from "./emblem.shared.js";
import { webSkin } from "./emblem.styles.js";

// Web Emblem (the base; Metro falls back to it on native, web bundlers resolve it).
export const Emblem = createEmblem(webSkin);
export type { EmblemProps } from "./emblem.shared.js";
