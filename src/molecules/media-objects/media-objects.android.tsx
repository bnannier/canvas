import { createMediaObject } from "./media-objects.shared.js";
import { androidSkin } from "./media-objects.styles.js";

// Material 3 MediaObject. Metro resolves this file on Android; the docs import it for preview.
export const MediaObject = createMediaObject(androidSkin);
export type { MediaObjectProps } from "./media-objects.shared.js";
