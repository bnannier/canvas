import { createAvatar, createAvatarGroup } from "./avatar.shared.js";
import { createAvatarMenu } from "./avatar-menu.shared.js";
import { webSkin, webMenuSkin } from "./avatar.styles.js";

// Web Avatar (the base; Metro falls back to it on native, web bundlers resolve it).
export const Avatar = createAvatar(webSkin);
export const AvatarGroup = createAvatarGroup(webSkin);
export const AvatarMenu = createAvatarMenu(webMenuSkin);
export type { AvatarProps, AvatarGroupProps } from "./avatar.shared.js";
export type { AvatarMenuProps } from "./avatar-menu.shared.js";
