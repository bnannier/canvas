import { createAvatar } from "./avatar.shared.js";
import { iosSkin } from "./avatar.styles.js";

// iOS (HIG) Avatar. Metro resolves this file on iOS; the docs import it for preview.
export const Avatar = createAvatar(iosSkin);
export type { AvatarProps } from "./avatar.shared.js";
