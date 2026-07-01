import { createAvatar, createAvatarGroup } from "./avatar.shared.js";
import { androidSkin } from "./avatar.styles.js";

// Material 3 Avatar. Metro resolves this file on Android; the docs import it for preview.
export const Avatar = createAvatar(androidSkin);
export const AvatarGroup = createAvatarGroup(androidSkin);
export type { AvatarProps, AvatarGroupProps } from "./avatar.shared.js";
