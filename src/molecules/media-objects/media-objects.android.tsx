import { createMediaObject } from "./media-objects.shared.js";
import { androidSkin } from "./media-objects.styles.js";
import { Avatar as AvatarAndroid } from "../../atoms/avatar/avatar.android.js";

// Material 3 MediaObject. Metro resolves this file on Android; the docs import it for
// preview. The leading Avatar is the Android-styled atom so the initials read native
// (500 weight, +0.1 tracking, controlRipple). The literal `.android` import is required
// for the WEB docs 3-up, where a barrel import would resolve the web Avatar.
export const MediaObject = createMediaObject(androidSkin, AvatarAndroid);
export type { MediaObjectProps } from "./media-objects.shared.js";
