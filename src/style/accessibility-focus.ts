import { AccessibilityInfo, Platform, TextInput } from "react-native";

// Moving focus into and out of an anchored card, the one way per platform. On the web
// it is DOM focus (the WAI-ARIA menu and listbox patterns move it into the first row or
// the selected option). Natively a View has no focus() at all, and what moves is the
// screen reader's, through the accessibility event each one moves its focus on
// (screenReaderFocusEvent); a text field takes the input focus as well. Android moves
// TalkBack only to a node that is itself an accessibility element, so a caller passes
// the row or the control, never a wrapper around it.
//
// The native move waits a frame: the card it lands in is revealed in the commit that
// calls this, and the platform takes that commit's mount first. For a text field the
// wait is what makes the focus land at all: React Native runs a view command such as
// focus ahead of the mount of the batch it arrives in, so a field focused in the commit
// that reveals it was focused before it was in the window, and the focus was lost.
//
// A move made while a card is entered (AnchoredOverlay runs its owner's onCardMount
// inside enterCard) scrolls its target into the card's scrollport: an option list opened
// at a selected option far down the list would otherwise hold the focus out of view
// (WCAG 2.4.11), and TalkBack cannot move to a node off the screen at all, so natively
// the move waits for the scroll.

/** A host node: a DOM element on the web, a native view handle otherwise. */
export type FocusNode = { focus?: (options?: { preventScroll?: boolean }) => void } | null | undefined;

const native = () => Platform.OS === "ios" || Platform.OS === "android";

/**
 * The accessibility event that moves the platform's screen reader to a node. VoiceOver
 * moves on `focus`, UIKit's layout-changed notification naming the element. TalkBack moves
 * on `viewHoverEnter`, the event its explore by touch moves its focus on. Android's `focus`
 * is TYPE_VIEW_FOCUSED, the report of a view taking INPUT focus, which TalkBack follows
 * only from a view that holds input focus: sent from a row, a title or a trigger it moved
 * nothing, and TalkBack seated its focus by itself (on the first node of the window when
 * a card hid the page, on the window's header when the card closed).
 */
function screenReaderFocusEvent(): "focus" | "viewHoverEnter" {
  return Platform.OS === "android" ? "viewHoverEnter" : "focus";
}

function sendNativeFocus(node: FocusNode, field = false): void {
  // React Native ignores a node that unmounted in the meantime.
  requestAnimationFrame(() => {
    if (field) node?.focus?.();
    AccessibilityInfo.sendAccessibilityEvent(node as never, screenReaderFocusEvent());
  });
}

/** Scroll `node` into view in a card's scrollport, then call `done` (at once when there is nothing to scroll). */
export type RevealInCard = (node: FocusNode, done: () => void) => void;

// The card being entered right now, while its owner's onCardMount runs (enterCard).
let entering: RevealInCard | null = null;

/**
 * Run `entry`, a card owner's onCardMount, as the card's entry: a focus move it makes
 * (focusInto, focusFieldInto, moveAccessibilityFocus) has `reveal` scroll its target into
 * the card's scrollport. Internal to AnchoredOverlay.
 */
export function enterCard(reveal: RevealInCard, entry: () => void): void {
  const outer = entering;
  entering = reveal;
  try {
    entry();
  } finally {
    entering = outer;
  }
}

// Natively the screen reader moves once the node is in view; on the web the DOM focus moves
// at once (the menu and listbox keys are live from the opening) and the port scrolls to it
// as soon as it has measured.
function revealThen(node: FocusNode, move: () => void): void {
  const reveal = entering;
  if (!reveal) move();
  else if (native()) reveal(node, move);
  else {
    move();
    reveal(node, () => {});
  }
}

/**
 * Move focus to `node`, inside a card that has just been revealed: DOM focus on the web
 * (without scrolling the page toward it), the screen reader's natively.
 */
export function focusInto(node: FocusNode): void {
  if (!node) return;
  revealThen(node, () => {
    if (native()) sendNativeFocus(node);
    else node.focus?.({ preventScroll: true });
  });
}

/**
 * Give a text field inside a card that has just been revealed the input focus, where
 * typing goes (Command's search): DOM focus on the web (without scrolling the page toward
 * it), and natively the field's own focus, a frame later, with the screen reader moved to
 * it too (VoiceOver does not follow a field that becomes first responder by itself).
 */
export function focusFieldInto(node: FocusNode): void {
  if (!node) return;
  revealThen(node, () => {
    if (native()) sendNativeFocus(node, true);
    else node.focus?.({ preventScroll: true });
  });
}

/**
 * Natively, move the screen reader to `node`, leaving DOM focus alone: into a card that
 * has just been revealed whose web focus another mechanism owns (Popover's panel,
 * usePopoverFocus), or back to the trigger after a modal card closed, where on the web
 * the DOM focus a closing card orphaned is restored instead (src/style/use-dialog-focus.ts).
 * A no-op on the web.
 */
export function moveAccessibilityFocus(node: FocusNode): void {
  if (node && native()) revealThen(node, () => sendNativeFocus(node));
}

/**
 * Natively, the text field that holds the input focus, or null: what a card's close
 * compares with the field that held it when the card was revealed, to tell a field the
 * close handed the focus to (PhoneInput's pick hands it to the number). Null on the web,
 * where the close reads the DOM's focus instead.
 */
export function focusedField(): FocusNode {
  if (!native()) return null;
  return (TextInput.State?.currentlyFocusedInput?.() ?? null) as FocusNode;
}

/**
 * Natively, take the input focus off a text field inside `card` as the card closes, while
 * the card is still in the window: Android hands the focus of a view removed while it
 * holds it to the first view of the window that takes focus by touch (a selectable text,
 * another field), and TalkBack follows it there, past the trigger the close returns it to.
 * A field outside the card (one the close handed the focus to) keeps it. A no-op on the
 * web, where the close restores the DOM's focus instead.
 */
export function releaseFieldIn(card: unknown): void {
  const field = focusedField();
  const holder = card as { contains?: (node: unknown) => boolean } | null;
  if (field && holder?.contains?.(field)) TextInput.State.blurTextInput(field as never);
}
