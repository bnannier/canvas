import { createAvatar, createAvatarGroup } from "./avatar.shared.js";
import { createAvatarMenu } from "./avatar-menu.shared.js";
import { createDropdown } from "../dropdown/dropdown.shared.js";
import { androidSkin as dropdownAndroidSkin } from "../dropdown/dropdown.styles.js";
import { androidSkin, androidMenuSkin } from "./avatar.styles.js";

// Material 3 Avatar. Metro resolves this file on Android; the docs import it for preview.
export const Avatar = createAvatar(androidSkin);
export const AvatarGroup = createAvatarGroup(androidSkin);

// The pill's menu is THIS platform's Dropdown, injected rather than imported: a bare
// import resolves the web module in a browser bundler, which would render the web menu
// under the iOS and Android pills in the docs. The hand-off stands the account menu off
// by 6 where a plain dropdown uses 4, and that lives in the skin, not in a prop.
const MenuDropdown = createDropdown({ ...dropdownAndroidSkin, menuGap: 6 });
export const AvatarMenu = createAvatarMenu(androidMenuSkin, MenuDropdown);
export type { AvatarProps, AvatarGroupProps } from "./avatar.shared.js";
export type { AvatarMenuProps } from "./avatar-menu.shared.js";
