import { createMediaObject } from "./media-objects.shared.js";
import { webSkin } from "./media-objects.styles.js";

// Web MediaObject (the base; Metro falls back to it on native, web bundlers resolve it).
export const MediaObject = createMediaObject(webSkin);
export type { MediaObjectProps } from "./media-objects.shared.js";
