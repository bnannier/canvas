import { createMediaObject } from "./media-objects.shared.js";
import { webSkin } from "./media-objects.styles.js";

// Web MediaObject (the base; Metro falls back to it on native, web bundlers resolve it).
/** An image or icon beside text content: the building block of list items and comments. */
export const MediaObject = createMediaObject(webSkin);
export type { MediaObjectProps } from "./media-objects.shared.js";
