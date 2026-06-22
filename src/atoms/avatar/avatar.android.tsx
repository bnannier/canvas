import { createAvatar } from "./avatar.shared.js";
import { androidSkin } from "./avatar.styles.js";

// Material 3 Avatar. Metro resolves this file on Android; the docs import it for preview.
export const Avatar = createAvatar(androidSkin);
export type { AvatarProps } from "./avatar.shared.js";
