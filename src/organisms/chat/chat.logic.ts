export { markdownBlocks as chatBlocks, markdownRuns as chatRuns, type MarkdownBlock as ChatBlock, type MarkdownRun as ChatRun } from "./markdown.logic.js";

/** Tail-following tolerates rounding while leaving a reader's older position alone. */
export function chatAtBottom(offset: number, viewport: number, content: number): boolean {
  return content - viewport - offset <= 48;
}
