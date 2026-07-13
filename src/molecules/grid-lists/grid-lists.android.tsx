import { createGridList } from "./grid-lists.shared.js";
import { androidSkin } from "./grid-lists.styles.js";
import { Card as CardAndroid } from "../card/card.android.js";
import { Avatar as AvatarAndroid } from "../../atoms/avatar/avatar.android.js";
import { Badge as BadgeAndroid } from "../../atoms/badge/badge.android.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";

// Material 3 GridList. Metro resolves this file on Android; the docs import it for
// preview. M3 12dp thumbnail, M3 type roles, and a surfaceRipple press feedback. The
// composed atoms are the M3-styled ones so each people tile renders the native Card
// (12dp radius, elevation-1, 16dp padding, surfaceRipple) with an M3 Avatar/Badge/
// Button. The literal `.android` imports are required for the WEB docs 3-up, where
// barrel imports would resolve the web atoms.
export const GridList = createGridList(androidSkin, CardAndroid, AvatarAndroid, BadgeAndroid, ButtonAndroid);
export type { GridListProps, GridListItem, GridListAction } from "./grid-lists.shared.js";
