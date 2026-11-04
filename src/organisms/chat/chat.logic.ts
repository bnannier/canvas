export { markdownBlocks as chatBlocks, markdownRuns as chatRuns, type MarkdownBlock as ChatBlock, type MarkdownRun as ChatRun } from "./markdown.logic.js";

/** Tail-following tolerates rounding while leaving a reader's older position alone. */
export function chatAtBottom(offset: number, viewport: number, content: number): boolean {
  return content - viewport - offset <= 48;
}

/** Keyboard modifiers exist on hardware-keyboard events. Native soft-keyboard Enter
 * events omit them, so they keep the multiline field's normal newline behavior. */
export function chatSubmitsOnEnter(event: {
  nativeEvent?: { key?: string; shiftKey?: boolean; altKey?: boolean; ctrlKey?: boolean; metaKey?: boolean; isComposing?: boolean; keyCode?: number; repeat?: boolean };
  defaultPrevented?: boolean;
}): boolean {
  const key = event.nativeEvent;
  return !!key && key.key === "Enter" && key.shiftKey === false
    && !key.altKey && !key.ctrlKey && !key.metaKey && !key.isComposing
    && key.keyCode !== 229 && !key.repeat && !event.defaultPrevented;
}
