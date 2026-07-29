import { createBoard } from "./board.shared.js";
import { iosSkin } from "./board.styles.js";
import { Card as CardIOS } from "../../molecules/card/card.ios.js";
import { Badge as BadgeIOS } from "../../atoms/badge/badge.ios.js";
import { RowMenu as RowMenuIOS } from "../row-menu/row-menu.ios.js";
import {
  DragDropProvider as DragDropProviderIOS,
  DropZone as DropZoneIOS,
  Draggable as DraggableIOS,
  DragHandle as DragHandleIOS,
} from "../drag-drop/drag-drop.ios.js";

// iOS (HIG) Board. Metro resolves this file on iOS; the docs import it for preview. The
// composed parts are the iOS-styled builds so each lane's cards, badges, kebab menus, and
// drag grips read native. The literal `.ios` imports are required for the WEB docs 3-up,
// where a barrel import would resolve the web builds.
export const Board = createBoard(iosSkin, {
  DragDropProvider: DragDropProviderIOS,
  DropZone: DropZoneIOS,
  Draggable: DraggableIOS,
  DragHandle: DragHandleIOS,
  Card: CardIOS,
  Badge: BadgeIOS,
  RowMenu: RowMenuIOS,
});
export { applyBoardMove } from "./board.logic.js";
export type { BoardProps, BoardColumn, BoardItem, BoardMove } from "./board.shared.js";
