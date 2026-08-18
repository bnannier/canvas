import { createAvatar, createAvatarGroup } from "./avatar.shared.js";
import { createAvatarMenu } from "./avatar-menu.shared.js";
import { createDropdown } from "../dropdown/dropdown.shared.js";
import { webSkin as dropdownWebSkin } from "../dropdown/dropdown.styles.js";
import { webSkin, webMenuSkin } from "./avatar.styles.js";

// Web Avatar (the base; Metro falls back to it on native, web bundlers resolve it).
export const Avatar = createAvatar(webSkin);
export const AvatarGroup = createAvatarGroup(webSkin);

// The pill's menu is THIS platform's Dropdown, injected rather than imported: a bare
// import resolves the web module in a browser bundler, which would render the web menu
// under the iOS and Android pills in the docs. The hand-off stands the account menu off
// by 6 where a plain dropdown uses 4, and that lives in the skin, not in a prop.
const MenuDropdown = createDropdown({ ...dropdownWebSkin, menuGap: 6 });
export const AvatarMenu = createAvatarMenu(webMenuSkin, MenuDropdown);
export type { AvatarProps, AvatarGroupProps } from "./avatar.shared.js";
export type { AvatarMenuProps } from "./avatar-menu.shared.js";
