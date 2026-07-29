import { createBoard } from "./board.shared.js";
import { androidSkin } from "./board.styles.js";
import { Card as CardAndroid } from "../../molecules/card/card.android.js";
import { Badge as BadgeAndroid } from "../../atoms/badge/badge.android.js";
import { RowMenu as RowMenuAndroid } from "../row-menu/row-menu.android.js";
import {
  DragDropProvider as DragDropProviderAndroid,
  DropZone as DropZoneAndroid,
  Draggable as DraggableAndroid,
  DragHandle as DragHandleAndroid,
} from "../drag-drop/drag-drop.android.js";

// Android (Material 3) Board. Metro resolves this file on Android; the docs import it for
// preview. The composed parts are the Android-styled builds so each lane's cards, badges,
// kebab menus, and drag grips read native. The literal `.android` imports are required for
// the WEB docs 3-up, where a barrel import would resolve the web builds.
export const Board = createBoard(androidSkin, {
  DragDropProvider: DragDropProviderAndroid,
  DropZone: DropZoneAndroid,
  Draggable: DraggableAndroid,
  DragHandle: DragHandleAndroid,
  Card: CardAndroid,
  Badge: BadgeAndroid,
  RowMenu: RowMenuAndroid,
});
export { applyBoardMove } from "./board.logic.js";
export type { BoardProps, BoardColumn, BoardItem, BoardMove } from "./board.shared.js";
