import { createMediaObject } from "./media-objects.shared.js";
import { iosSkin } from "./media-objects.styles.js";
import { Avatar as AvatarIOS } from "../../atoms/avatar/avatar.ios.js";

// iOS (SF / HIG) MediaObject. Metro resolves this file on iOS; the docs import it for
// preview. The leading Avatar is the iOS-styled atom so the initials read native (600
// weight, SF tracking, interactive-glass fallback, dim 0.8). The literal `.ios` import
// is required for the WEB docs 3-up, where a barrel import would resolve the web Avatar.
export const MediaObject = createMediaObject(iosSkin, AvatarIOS);
export type { MediaObjectProps } from "./media-objects.shared.js";
