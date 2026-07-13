import { createGridList } from "./grid-lists.shared.js";
import { iosSkin } from "./grid-lists.styles.js";
import { Card as CardIOS } from "../card/card.ios.js";
import { Avatar as AvatarIOS } from "../../atoms/avatar/avatar.ios.js";
import { Badge as BadgeIOS } from "../../atoms/badge/badge.ios.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";

// iOS (HIG Collections) GridList. Metro resolves this file on iOS; the docs import
// it for preview. Softer thumbnail corner (continuous curve) and SF type tightening;
// press = opacity dim. The composed atoms are the iOS-styled ones so each people
// tile renders the native Card (12pt radius, flat resting surface) with an iOS
// Avatar/Badge/Button. The literal `.ios` imports are required for the WEB docs
// 3-up, where barrel imports would resolve the web atoms.
export const GridList = createGridList(iosSkin, CardIOS, AvatarIOS, BadgeIOS, ButtonIOS);
export type { GridListProps, GridListItem, GridListAction } from "./grid-lists.shared.js";
