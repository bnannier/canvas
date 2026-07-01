import { createAvatar, createAvatarGroup } from "./avatar.shared.js";
import { iosSkin } from "./avatar.styles.js";

// iOS (HIG) Avatar. Metro resolves this file on iOS; the docs import it for preview.
export const Avatar = createAvatar(iosSkin);
export const AvatarGroup = createAvatarGroup(iosSkin);
export type { AvatarProps, AvatarGroupProps } from "./avatar.shared.js";
