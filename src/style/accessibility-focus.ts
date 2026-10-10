import { AccessibilityInfo, Platform } from "react-native";

// Moving focus into and out of an anchored card, the one way per platform. On the web
// it is DOM focus (the WAI-ARIA menu and listbox patterns move it into the first row or
// the selected option). Natively a View has no focus() at all, and what moves is the
// screen reader's: VoiceOver and TalkBack are sent to the node with the same
// `sendAccessibilityEvent(node, "focus")` the kit's selection return uses
// (src/style/use-accessibility-return.tsx). Android moves TalkBack only to a node that
// is itself an accessibility element, so a caller passes the row or the control, never
// a wrapper around it. The native move waits a frame: the card it lands in is revealed
// in the commit that calls this, and the platform's accessibility tree takes that
// commit's mount first.

/** A host node: a DOM element on the web, a native view handle otherwise. */
export type FocusNode = { focus?: (options?: { preventScroll?: boolean }) => void } | null | undefined;

const native = () => Platform.OS === "ios" || Platform.OS === "android";

function sendNativeFocus(node: FocusNode): void {
  // React Native ignores a node that unmounted in the meantime.
  requestAnimationFrame(() => AccessibilityInfo.sendAccessibilityEvent(node as never, "focus"));
}

/**
 * Move focus to `node`, inside a card that has just been revealed: DOM focus on the web
 * (without scrolling the page toward it), the screen reader's natively.
 */
export function focusInto(node: FocusNode): void {
  if (!node) return;
  if (native()) sendNativeFocus(node);
  else node.focus?.({ preventScroll: true });
}

/**
 * Natively, move the screen reader to `node` inside a card that has just been revealed,
 * leaving DOM focus alone: for a card whose web focus another mechanism owns (Popover's
 * panel, usePopoverFocus). A no-op on the web.
 */
export function moveAccessibilityFocus(node: FocusNode): void {
  if (node && native()) sendNativeFocus(node);
}

/**
 * Natively, send the screen reader back to `node` (the trigger) after a modal card
 * closed. A no-op on the web, where the DOM focus a closing card orphaned is restored
 * instead (src/style/use-dialog-focus.ts).
 */
export function returnAccessibilityFocus(node: FocusNode): void {
  if (node && native()) sendNativeFocus(node);
}
