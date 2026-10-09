import { createBoard } from "./board.shared.js";
import { webSkin } from "./board.styles.js";

// Web Board (the base; Metro falls back to it on native, web bundlers resolve it). The
// composed parts default to the web builds inside createBoard.
/** A kanban board: columns of cards that move by drag or keyboard between and within columns. */
export const Board = createBoard(webSkin);
export { applyBoardMove } from "./board.logic.js";
export type { BoardProps, BoardColumn, BoardItem, BoardMove } from "./board.shared.js";
