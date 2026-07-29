import { createStackedList } from "./stacked-lists.shared.js";
import { androidSkin } from "./stacked-lists.styles.js";
import { Avatar as AvatarAndroid } from "../../atoms/avatar/avatar.android.js";
import { Badge as BadgeAndroid } from "../../atoms/badge/badge.android.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";
import {
  DragDropProvider as DragDropProviderAndroid,
  DropZone as DropZoneAndroid,
  Draggable as DraggableAndroid,
  DragHandle as DragHandleAndroid,
} from "../../organisms/drag-drop/drag-drop.android.js";

// Material 3 StackedList. Metro resolves this file on Android; the docs import it
// for preview. The composed atoms are the M3-styled ones so each row's initials
// avatar, trailing badge, and the header Add button read native (M3 ripple on the
// button), and the reorderable rows' drag grips take the M3 48dp circular target.
// The literal `.android` imports are required for the WEB docs 3-up, where a
// barrel import would resolve the web atoms.
export const StackedList = createStackedList(androidSkin, AvatarAndroid, BadgeAndroid, ButtonAndroid, {
  DragDropProvider: DragDropProviderAndroid,
  DropZone: DropZoneAndroid,
  Draggable: DraggableAndroid,
  DragHandle: DragHandleAndroid,
});
export type { StackedListProps, StackedListItem, StackedListMove } from "./stacked-lists.shared.js";
