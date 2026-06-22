import { createAvatar } from "./avatar.shared.js";
import { webSkin } from "./avatar.styles.js";

// Web Avatar (the base; Metro falls back to it on native, web bundlers resolve it).
export const Avatar = createAvatar(webSkin);
export type { AvatarProps } from "./avatar.shared.js";
