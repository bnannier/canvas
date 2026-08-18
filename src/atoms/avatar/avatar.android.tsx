import { createAvatar, createAvatarGroup } from "./avatar.shared.js";
import { createAvatarMenu } from "./avatar-menu.shared.js";
import { androidSkin, androidMenuSkin } from "./avatar.styles.js";

// Material 3 Avatar. Metro resolves this file on Android; the docs import it for preview.
export const Avatar = createAvatar(androidSkin);
export const AvatarGroup = createAvatarGroup(androidSkin);
export const AvatarMenu = createAvatarMenu(androidMenuSkin);
export type { AvatarProps, AvatarGroupProps } from "./avatar.shared.js";
export type { AvatarMenuProps } from "./avatar-menu.shared.js";
