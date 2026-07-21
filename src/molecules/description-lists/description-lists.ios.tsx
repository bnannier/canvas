import { createDescriptionList } from "./description-lists.shared.js";
import { iosSkin } from "./description-lists.styles.js";
import { Avatar as AvatarIOS, AvatarGroup as AvatarGroupIOS } from "../../atoms/avatar/avatar.ios.js";
import { Badge as BadgeIOS } from "../../atoms/badge/badge.ios.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";

// iOS (iOS 27 kit Lists value rows) DescriptionList. Metro resolves this file on
// iOS; the docs import it for preview. The composed Badge and Button are the
// iOS-styled ones so a value row's status/metadata badge and the trailing Update
// link read native (plain tinted SF text, capsule; the Button skin's minTarget
// lifts the link to a 44pt target). The literal `.ios` imports are required for
// the WEB docs 3-up, where barrel imports would resolve the web atoms.
export const DescriptionList = createDescriptionList(iosSkin, BadgeIOS, ButtonIOS, AvatarIOS, AvatarGroupIOS);
export type { DescriptionListProps, DescriptionListItem, DescriptionListAvatar } from "./description-lists.shared.js";
