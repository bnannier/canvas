import { createMediaObject } from "./media-objects.shared.js";
import { iosSkin } from "./media-objects.styles.js";

// iOS (SF / HIG) MediaObject. Metro resolves this file on iOS; the docs import it for preview.
export const MediaObject = createMediaObject(iosSkin);
export type { MediaObjectProps } from "./media-objects.shared.js";
