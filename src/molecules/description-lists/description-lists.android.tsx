import { createDescriptionList } from "./description-lists.shared.js";
import { androidSkin } from "./description-lists.styles.js";
import { Avatar as AvatarAndroid, AvatarGroup as AvatarGroupAndroid } from "../../atoms/avatar/avatar.android.js";
import { Badge as BadgeAndroid } from "../../atoms/badge/badge.android.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";

// Material 3 DescriptionList. Metro resolves this file on Android; the docs
// import it for preview. The composed Badge and Button are the M3-styled ones so
// a value row's status/metadata badge and the trailing Update link read native
// (M3 text-button ripple; the Button skin's minTarget lifts the link to a 48dp
// target). The literal `.android` imports are required for the WEB docs 3-up,
// where barrel imports would resolve the web atoms.
export const DescriptionList = createDescriptionList(androidSkin, BadgeAndroid, ButtonAndroid, AvatarAndroid, AvatarGroupAndroid);
export type { DescriptionListProps, DescriptionListItem, DescriptionListAvatar } from "./description-lists.shared.js";
