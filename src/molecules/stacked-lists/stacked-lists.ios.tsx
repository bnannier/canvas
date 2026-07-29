import { createStackedList } from "./stacked-lists.shared.js";
import { iosSkin } from "./stacked-lists.styles.js";
import { Avatar as AvatarIOS } from "../../atoms/avatar/avatar.ios.js";
import { Badge as BadgeIOS } from "../../atoms/badge/badge.ios.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";
import {
  DragDropProvider as DragDropProviderIOS,
  DropZone as DropZoneIOS,
  Draggable as DraggableIOS,
  DragHandle as DragHandleIOS,
} from "../../organisms/drag-drop/drag-drop.ios.js";

// iOS (SF / HIG inset-grouped list) StackedList. Metro resolves this file on iOS;
// the docs import it for preview. The composed atoms are the iOS-styled ones so
// each row's initials avatar, trailing badge, and the header Add button read
// native, and the reorderable rows' drag grips take the HIG 32pt sizing. The
// literal `.ios` imports are required for the WEB docs 3-up, where a barrel
// import would resolve the web atoms.
export const StackedList = createStackedList(iosSkin, AvatarIOS, BadgeIOS, ButtonIOS, {
  DragDropProvider: DragDropProviderIOS,
  DropZone: DropZoneIOS,
  Draggable: DraggableIOS,
  DragHandle: DragHandleIOS,
});
export type { StackedListProps, StackedListItem, StackedListMove } from "./stacked-lists.shared.js";
