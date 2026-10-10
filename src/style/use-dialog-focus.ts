import { useEffect, useRef, useState, type RefObject } from "react";
import { type View } from "react-native";

// Refs may attach after the hook's open effect: Portal publishes into a sibling
// outlet, and anchored overlays also wait for a trigger measurement. An ordinary
// useRef cannot notify that effect when its panel finally exists. Keep the public
// object-ref API, but reconcile focus from its current setter as well as open.
// These are DOM event/focus operations only, never a platform rendering fork.

const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]';

interface FocusSession {
  panel: HTMLElement;
  restoreTarget: HTMLElement | null;
}

// An initially open inline child runs its effect before its parent. The parent
// must preserve the child's focus and original restoration target, instead of
// focusing over it or later restoring into its own disappearing subtree.
const sessions = new Set<FocusSession>();

function trapFocus(panel: HTMLElement): () => void {
  const onKeyDown = (event: KeyboardEvent) => {
    // A nested modal may already have wrapped this Tab. Leave that move intact.
    if (event.key !== "Tab" || event.defaultPrevented) return;
    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    ).filter(
      (el) => !el.hasAttribute("disabled") && el.getAttribute("tabindex") !== "-1",
    );
    if (focusables.length === 0) {
      event.preventDefault();
      panel.focus({ preventScroll: true });
      return;
    }
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;
    if (event.shiftKey) {
      if (active === first || active === panel || !panel.contains(active)) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      }
    } else if (active === last) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  };
  panel.addEventListener("keydown", onKeyDown);
  return () => panel.removeEventListener("keydown", onKeyDown);
}

function createFocusRef(modal: boolean, onAttach: () => void) {
  let node: View | null = null;
  let enabled = false;
  let restoreTarget: HTMLElement | null = null;
  let session: FocusSession | null = null;
  let removeTrap: (() => void) | undefined;

  const detach = () => {
    if (!session) return;
    const previous = session;
    restoreTarget = previous.restoreTarget;
    session = null;
    removeTrap?.();
    removeTrap = undefined;
    // Portaled children are DOM siblings. Their restoration targets still name
    // the control or panel they opened from, so follow that chain when deciding
    // whether a closing parent owns the current focus.
    const owned = new Set([previous]);
    for (const parent of owned) {
      for (const candidate of sessions) {
        if (parent.panel.contains(candidate.panel) || parent.panel.contains(candidate.restoreTarget)) {
          owned.add(candidate);
        }
      }
    }
    sessions.delete(previous);
    for (const child of owned) {
      if (child !== previous && previous.panel.contains(child.restoreTarget)) {
        child.restoreTarget = previous.restoreTarget;
      }
    }

    // Restore only focus owned by this panel. In particular, a nonmodal popover
    // may close after the user has tabbed to another live control. Its close must
    // not pull that deliberate focus move back to the trigger.
    const active = document.activeElement;
    const orphaned = active == null || active === document.body ||
      !active.isConnected || [...owned].some((owner) => owner.panel.contains(active));
    if (orphaned && previous.restoreTarget?.isConnected) {
      previous.restoreTarget.focus({ preventScroll: true });
    }
  };

  const attach = () => {
    if (!enabled || session || !node || typeof document === "undefined") return;
    const panel = node as unknown as HTMLElement;
    const active = document.activeElement;
    const descendants = [...sessions].filter((candidate) =>
      panel.contains(candidate.panel) && candidate.panel.contains(active),
    );
    const child = descendants.find((candidate) => !descendants.some((other) =>
      other !== candidate && other.panel.contains(candidate.panel),
    ));
    // Follow the child's original target only when our captured target belongs
    // to this panel. Ordinary nested openings still restore to their own trigger.
    if (child && restoreTarget && panel.contains(restoreTarget)) {
      restoreTarget = child.restoreTarget;
    }
    // An initially open child has no opener inside this newly active parent.
    // Closing just that child must return to the parent, while closing the whole
    // parent still restores the original page trigger captured above.
    if (child && !panel.contains(child.restoreTarget)) child.restoreTarget = panel;
    session = { panel, restoreTarget };
    sessions.add(session);
    if (modal) removeTrap = trapFocus(panel);
    if (!child) panel.focus({ preventScroll: true });
  };

  const ref: RefObject<View | null> = {
    get current() { return node; },
    set current(next: View | null) {
      if (next === node) return;
      detach();
      node = next;
      // Setup follows a committed effect, so attaching a panel in the same
      // render that closes it cannot briefly focus it with the previous open
      // value. Detachment still removes its listener immediately.
      if (next && typeof document !== "undefined") onAttach();
    },
  };

  return {
    ref,
    attach,
    activate() {
      if (enabled) return;
      enabled = true;
      // Capture once per opening, including the interval before a hosted panel
      // attaches. Ref replacement or duplicate attachment cannot overwrite it.
      restoreTarget = typeof document === "undefined"
        ? null
        : document.activeElement as HTMLElement | null;
      attach();
    },
    deactivate() {
      enabled = false;
      detach();
      restoreTarget = null;
    },
  };
}

function usePanelFocus(open: boolean, modal: boolean): RefObject<View | null> {
  const [attachment, setAttachment] = useState(0);
  const controllerRef = useRef<ReturnType<typeof createFocusRef> | null>(null);
  if (controllerRef.current == null) {
    controllerRef.current = createFocusRef(modal, () => setAttachment((version) => version + 1));
  }
  const controller = controllerRef.current;

  useEffect(() => {
    if (!open) return;
    controller.activate();
    return () => controller.deactivate();
  }, [open, controller]);

  useEffect(() => {
    controller.attach();
  }, [attachment, controller]);

  return controller.ref;
}

/** Move focus into an attached modal panel, trap Tab, and restore on close.
 * Attach the returned object ref to a View with tabIndex={-1}. Native and SSR
 * do not touch DOM globals; native modal accessibility remains the caller's. */
export function useDialogFocus(open: boolean): RefObject<View | null> {
  return usePanelFocus(open, true);
}

/** Move focus into an attached nonmodal panel and restore on close. Tab remains
 * free to leave the panel. Pass false for an always-visible inline popover. */
export function usePopoverFocus(open: boolean): RefObject<View | null> {
  return usePanelFocus(open, false);
}

// ---------------------------------------------------------------------------
// An anchored card's place in the tab order (AnchoredOverlay).
//
// A hosted card renders in its window layer's outlet, after the whole page, so in DOM
// order its controls come last: Tab from its last control went to the end of the
// document while the card stayed open, and Tab from the page's last control went into
// it. The bridge restores the order the card would have had in flow, right after its
// trigger, the way an HTML popover and Floating UI's preserveTabOrder do, with no
// rendered guard nodes (a focusable guard View would also render natively and become
// an Android keyboard stop). While the card is open one capture listener steers every
// Tab whose browser move differs from that logical order: from the trigger into the
// card, from the card's ends back to the trigger or on to the control after it, and
// past the card for the page's own moves. At the very end of the page there is no
// later stop the document can focus, so that one move is left to the browser.

const TABBABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]';

function isTabbable(element: HTMLElement): boolean {
  if (element.hasAttribute("disabled")) return false;
  const tabindex = element.getAttribute("tabindex");
  if (tabindex != null && Number(tabindex) < 0) return false;
  // A held card, a covered page and an inert subtree take no focus.
  return element.closest('[aria-hidden="true"], [inert]') == null;
}

function tabbables(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(isTabbable);
}

const follows = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

interface Bridge { card: HTMLElement; trigger: HTMLElement; onLeave?: () => void }
// Every open card, in the order they opened: a card opened from inside another is
// placed within its parent's run, so the order is composed outermost first.
const bridges: Bridge[] = [];

/** The page's tab order with each open card's controls moved to just after its trigger. */
function logicalOrder(): HTMLElement[] {
  let order = tabbables(document);
  for (const { card, trigger } of bridges) {
    if (!card.isConnected || !trigger.isConnected) continue;
    const inCard = order.filter((element) => card.contains(element));
    const rest = order.filter((element) => !card.contains(element));
    // After the trigger's own controls, or after the last stop before it.
    let at = 0;
    rest.forEach((element, index) => {
      if (trigger.contains(element) || follows(element, trigger)) at = index + 1;
    });
    order = [...rest.slice(0, at), ...inCard, ...rest.slice(at)];
  }
  return order;
}

/** Where a Tab (or Shift+Tab) from `active` goes in `order`, which need not hold `active`. */
function step(order: HTMLElement[], active: HTMLElement, back: boolean): HTMLElement | undefined {
  const index = order.indexOf(active);
  if (index >= 0) return order[index + (back ? -1 : 1)];
  // A focused node that is not a tab stop itself (a card panel with tabIndex -1, the
  // body): the next stop after it, or the last one before it, in DOM order.
  const after = order.findIndex((element) => follows(active, element));
  if (back) return order[(after < 0 ? order.length : after) - 1];
  return after < 0 ? undefined : order[after];
}

function onBridgedKeyDown(event: KeyboardEvent): void {
  if (event.key !== "Tab" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const active = document.activeElement as HTMLElement | null;
  if (!active) return;
  const back = event.shiftKey;
  // A focused card panel that is no tab stop sits at the head of its card's run.
  const order = logicalOrder();
  const owner = order.includes(active) ? null : bridges.find(({ card }) => card.contains(active));
  const run = owner ? order.filter((element) => owner.card.contains(element)) : [];
  const target = !owner ? step(order, active, back)
    : run.length > 0 ? (back ? order[order.indexOf(run[0]!) - 1] : run[0])
    : back ? triggerStop(order, owner) : afterTrigger(order, owner);
  const browser = step(tabbables(document), active, back);
  if (target && target !== browser) {
    event.preventDefault();
    target.focus();
  }
  // A Tab that takes focus out of a card (and its trigger) closes a card that asks.
  const landing = target ?? browser;
  for (const { card, trigger, onLeave } of [...bridges]) {
    if (!onLeave) continue;
    const fromCard = card.contains(active);
    const fromTrigger = trigger.contains(active);
    const intoCard = landing != null && card.contains(landing);
    const intoTrigger = landing != null && trigger.contains(landing);
    if ((fromCard && !intoCard) || (fromTrigger && !intoCard && !intoTrigger)) onLeave();
  }
}

// The trigger's last stop (or the last one before it) in the composed order, and the
// first stop after it: where Shift+Tab and Tab from a card with no stops of its own go.
function triggerStop(order: HTMLElement[], { card, trigger }: Bridge): HTMLElement | undefined {
  return order.filter((element) => !card.contains(element) && (trigger.contains(element) || follows(element, trigger))).pop();
}
function afterTrigger(order: HTMLElement[], bridge: Bridge): HTMLElement | undefined {
  const before = triggerStop(order, bridge);
  return order.slice(before ? order.indexOf(before) + 1 : 0).find((element) => !bridge.card.contains(element));
}

/**
 * Keep an open card's controls in the tab order right after its trigger, until the
 * returned function is called. `onLeave` runs after a Tab has moved focus out of the
 * card, or off its trigger anywhere but into the card (a menu or option list closes
 * then: the WAI-ARIA menu and listbox patterns' Tab). DOM focus only; nothing is
 * rendered, and natively (no document) it does nothing.
 */
export function bridgeTabOrder(card: HTMLElement, trigger: HTMLElement, onLeave?: () => void): () => void {
  if (typeof document === "undefined") return () => {};
  const bridge: Bridge = { card, trigger, onLeave };
  if (bridges.length === 0) document.addEventListener("keydown", onBridgedKeyDown, true);
  bridges.push(bridge);
  return () => {
    const index = bridges.indexOf(bridge);
    if (index >= 0) bridges.splice(index, 1);
    if (bridges.length === 0) document.removeEventListener("keydown", onBridgedKeyDown, true);
  };
}

/**
 * After an anchored card closes, give back the focus its closing orphaned: focus that
 * was inside the card, or fell to the body when the card left the document, goes back
 * to what opened the card (`opener`, the element focused when it opened, as
 * usePopoverFocus restores) and otherwise to the trigger (`target`, or the first tab
 * stop inside it). Focus the user already moved to another live control stays where
 * it is. DOM focus only; a no-op natively.
 */
export function restoreOrphanedFocus(card: HTMLElement | null, target: HTMLElement | null, opener?: Element | null): void {
  if (typeof document === "undefined") return;
  const active = document.activeElement as HTMLElement | null;
  const orphaned = active == null || active === document.body || !active.isConnected || (card != null && card.contains(active));
  if (!orphaned) return;
  if (opener instanceof HTMLElement && opener.isConnected && opener !== document.body && !card?.contains(opener)) {
    opener.focus({ preventScroll: true });
    return;
  }
  if (!target?.isConnected) return;
  const stop = isTabbable(target) && target.matches(TABBABLE_SELECTOR) ? target : tabbables(target)[0];
  (stop ?? target).focus({ preventScroll: true });
}
