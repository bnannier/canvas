import { useEffect, useRef, useState, type RefObject } from "react";
import { type View } from "react-native";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

// Refs may attach after the hook's open effect: Portal publishes into a sibling
// outlet, and anchored overlays also wait for a trigger measurement. An ordinary
// useRef cannot notify that effect when its panel finally exists. Keep the public
// object-ref API, but reconcile focus from its current setter as well as open.
// These are DOM event/focus operations only, never a platform rendering fork.

// The tab stops a panel or the page holds, as sequential focus reaches them (short of the
// browser's visibility checks): no disabled control, no negative tabindex, and nothing
// inside a held card, a covered page or an inert subtree.
const TABBABLE_SELECTOR = 'a[href], button, input, select, textarea, [tabindex]';

function isTabbable(element: HTMLElement): boolean {
  if (element.hasAttribute("disabled")) return false;
  const tabindex = element.getAttribute("tabindex");
  if (tabindex != null && Number(tabindex) < 0) return false;
  return element.closest('[aria-hidden="true"], [inert]') == null;
}

function tabbables(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(TABBABLE_SELECTOR)).filter(isTabbable);
}

// Whether a closing panel orphaned the focus: it is on nothing, on the body, on a node
// that left the document, or still inside one of the closing panels. Focus the user
// already moved to another live control is not orphaned, and a close never pulls it back.
function focusOrphaned(panels: readonly (HTMLElement | null)[]): boolean {
  const active = document.activeElement;
  return active == null || active === document.body || !active.isConnected || panels.some((panel) => panel?.contains(active));
}

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
    const focusables = tabbables(panel);
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
    if (focusOrphaned([...owned].map((owner) => owner.panel)) && previous.restoreTarget?.isConnected) {
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
// past the card for the page's own moves. A card opened from inside another sits in its
// parent's run, right after its own trigger there. A focused node that is no stop itself
// moves by where it stands: in a card (the card's panel, a row the roving stop is not
// on) to the card's stops on either side of it, and in the page to the stops around its
// place, a card's run standing at its trigger's.
//
// The order is the one the focus is held in: a modal around the trigger (a Dialog's
// panel, a native Modal's content, anything `aria-modal`) keeps Tab inside itself, and
// past either end of its order focus wraps to the other, as the modal's own trap does.
// A card that holds the focus itself (a modal sheet, `trap`) is such a modal while it is
// open, the topmost one wherever focus stands short of a modal opened over it: a Tab from
// the page behind it (or from a sheet under it) enters it, and its own controls, with the
// runs of cards opened from inside it, are the whole order. Without one the order is the page's, and at its very end there is no later
// stop the document can focus, so that one move is left to the browser.

const follows = (a: Node, b: Node) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;

interface Bridge { card: HTMLElement; trigger: HTMLElement; onLeave?: () => void; trap?: boolean }
// Every open card, in the order they opened.
const bridges: Bridge[] = [];

// The open card that holds `node`: the innermost one, where cards nest in the document.
function cardOf(node: Node): Bridge | undefined {
  const holding = bridges.filter(({ card }) => card.contains(node));
  return holding.find((bridge) => !holding.some((other) => other !== bridge && bridge.card.contains(other.card)));
}

// Where `node` stands in the page: itself, or for a node in an open card, the card's
// trigger (through every card it sits in, up to a card that holds the focus, which is
// a place of its own).
function anchorOf(node: Node): Node {
  let at = node;
  for (let depth = 0; depth < bridges.length; depth += 1) {
    const owner = cardOf(at);
    if (!owner || owner.trap) break;
    at = owner.trigger;
  }
  return at;
}

// How many open cards a card's trigger sits in, so a parent card is composed before the
// cards opened from inside it.
function depthOf({ trigger }: Bridge): number {
  let depth = 0;
  for (let owner = cardOf(trigger); owner && depth < bridges.length; owner = cardOf(owner.trigger)) depth += 1;
  return depth;
}

// The modal the focus at `node` is held in: the innermost `aria-modal` element around
// where it stands in the page, or null for the page itself; but while a card that holds the
// focus is open, the topmost such card, wherever the focus stands, unless it stands in a
// modal opened over that card (a Dialog opened from it: one that is neither around the card
// nor inside an open card that holds the focus).
function modalScope(node: Node): Element | null {
  const anchor = anchorOf(node);
  const element = anchor.nodeType === Node.ELEMENT_NODE ? (anchor as Element) : anchor.parentElement;
  const modal = element?.closest('[aria-modal="true"]') ?? null;
  const held = bridges.filter(({ card, trap }) => trap && card.isConnected);
  const top = held[held.length - 1]?.card;
  if (!top) return modal;
  const over = modal != null && !modal.contains(top) && !held.some(({ card }) => card.contains(modal));
  return over ? modal : top;
}

// Where a run placed right after `node` goes in `order`: after the node's own stops; or
// else after the last stop before it among those that share its place (its own card's,
// or the page's, never another card's run); or else where its card's run starts.
function slotAfter(order: readonly HTMLElement[], node: Node): number {
  let at = -1;
  order.forEach((element, index) => { if (node.contains(element)) at = index; });
  if (at >= 0) return at + 1;
  const owner = cardOf(node);
  order.forEach((element, index) => { if (cardOf(element) === owner && follows(element, node)) at = index; });
  if (at >= 0) return at + 1;
  return owner ? slotAfter(order, owner.trigger) : 0;
}

/** The tab order inside `scope` (the page when null), each open card's controls moved to just after its trigger. */
function logicalOrder(scope: Element | null): HTMLElement[] {
  let order = tabbables(document);
  if (scope) order = order.filter((element) => scope.contains(anchorOf(element)));
  const open = bridges.filter(({ card, trigger }) => card.isConnected && trigger.isConnected);
  const depth = new Map(open.map((bridge) => [bridge, depthOf(bridge)]));
  for (const { card, trigger } of open.sort((a, b) => depth.get(a)! - depth.get(b)!)) {
    // The card that holds the focus is the scope itself, not a run placed in it.
    if (card === scope) continue;
    const inCard = order.filter((element) => card.contains(element));
    const rest = order.filter((element) => !card.contains(element));
    const at = slotAfter(rest, trigger);
    order = [...rest.slice(0, at), ...inCard, ...rest.slice(at)];
  }
  return order;
}

/**
 * Where a Tab (or Shift+Tab) from `active` goes in `order`, which need not hold it: from
 * a node that is no stop, the first stop placed after where it stands, or the last placed
 * before it. `place` is where a node stands: itself in document order (the browser's own
 * move), or its card's trigger in the composed order.
 */
function step(order: HTMLElement[], active: HTMLElement, back: boolean, place: (node: Node) => Node = (node) => node): HTMLElement | undefined {
  const index = order.indexOf(active);
  if (index >= 0) return order[index + (back ? -1 : 1)];
  const from = place(active);
  const after = order.findIndex((element) => follows(from, place(element)));
  if (back) return order[(after < 0 ? order.length : after) - 1];
  return after < 0 ? undefined : order[after];
}

/** Where a Tab (or Shift+Tab) from `active` goes in the composed `order`. */
function logicalStep(order: HTMLElement[], active: HTMLElement, back: boolean): HTMLElement | undefined {
  const owner = order.includes(active) ? undefined : cardOf(active);
  if (!owner) return step(order, active, back, anchorOf);
  const run = order.filter((element) => owner.card.contains(element));
  // A card with no stops of its own stands right after its trigger's.
  if (run.length === 0) {
    const at = slotAfter(order, owner.trigger);
    return order[back ? at - 1 : at];
  }
  // A node in the card that is no stop: the card's stops on either side of it in document
  // order, and before the first or after the last of them, the stops around the run.
  const next = run.findIndex((element) => follows(active, element));
  if (back) return next > 0 ? run[next - 1] : next < 0 ? run[run.length - 1] : order[order.indexOf(run[0]!) - 1];
  return next >= 0 ? run[next] : order[order.indexOf(run[run.length - 1]!) + 1];
}

function onBridgedKeyDown(event: KeyboardEvent): void {
  if (event.key !== "Tab" || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const active = document.activeElement as HTMLElement | null;
  if (!active) return;
  const back = event.shiftKey;
  const scope = modalScope(active);
  const order = logicalOrder(scope);
  // Inside a modal, past either end of its order, focus wraps as its own trap wraps it.
  const target = logicalStep(order, active, back) ?? (scope ? (back ? order[order.length - 1] : order[0]) : undefined);
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

// Keep an open card's controls in the tab order right after its trigger (or, with
// `trap`, keep the focus inside the card), until the returned function is called.
function bridgeTabOrder(card: HTMLElement, trigger: HTMLElement, onLeave?: () => void, trap = false): () => void {
  const bridge: Bridge = { card, trigger, onLeave, trap };
  if (bridges.length === 0) document.addEventListener("keydown", onBridgedKeyDown, true);
  bridges.push(bridge);
  return () => {
    const index = bridges.indexOf(bridge);
    if (index >= 0) bridges.splice(index, 1);
    if (bridges.length === 0) document.removeEventListener("keydown", onBridgedKeyDown, true);
  };
}

// After a card closes, give back the focus its closing orphaned: focus that was inside
// the card, or fell to the body when the card left the document, goes back to what had
// focus when the card opened (`opener`, as usePopoverFocus restores) and otherwise to the
// first stop in `target`. Focus the user already moved to another live control stays.
function restoreOrphanedFocus(card: HTMLElement | null, target: HTMLElement | null, opener: Element | null): void {
  if (!focusOrphaned([card])) return;
  if (opener instanceof HTMLElement && opener.isConnected && opener !== document.body && !card?.contains(opener)) {
    opener.focus({ preventScroll: true });
    return;
  }
  if (!target?.isConnected) return;
  const stop = isTabbable(target) && target.matches(TABBABLE_SELECTOR) ? target : tabbables(target)[0];
  (stop ?? target).focus({ preventScroll: true });
}

/** What useAnchoredCardFocus reads. */
export interface AnchoredCardFocusOptions {
  /** The card is revealed and its controls can take focus. */
  shown: boolean;
  /** The card's root. */
  cardRef: RefObject<View | null>;
  /** The control the card opened from: its stops come right before the card's. */
  triggerRef: RefObject<View | null>;
  /** Where focus goes back when the card closes, if what had focus at the opening is gone. */
  returnRef: RefObject<View | null>;
  /**
   * Runs after a Tab takes focus out of the card, or off its trigger anywhere but into
   * the card (a menu or option list closes then: the WAI-ARIA menu and listbox patterns).
   */
  onLeave?: () => void;
  /** Give orphaned focus back on close (false for a combobox's popup, whose field kept it). */
  restore: boolean;
  /**
   * Keep keyboard focus inside the card while it is shown (a modal sheet): Tab and
   * Shift+Tab wrap at the ends of its controls (and of the cards opened from inside it),
   * and a Tab from the page behind it enters it.
   */
  trap?: boolean;
}

/**
 * An anchored card's keyboard focus on the web (AnchoredOverlay): while it is shown, its
 * controls keep their place in the tab order right after its trigger, inside the modal
 * the trigger sits in, if any, or with `trap` they are the whole order; when it unmounts,
 * the focus it held and its closing orphaned goes back to what had focus when it opened,
 * or else to the first stop in `returnRef`. Focus the user already moved to another live
 * control stays where it is. DOM focus only; natively and during SSR it does nothing.
 */
export function useAnchoredCardFocus({ shown, cardRef, triggerRef, returnRef, onLeave, restore, trap = false }: AnchoredCardFocusOptions): void {
  const leave = useRef(onLeave);
  leave.current = onLeave;
  const leaves = onLeave != null;
  // Whether keyboard focus was ever inside the card: only focus the card held is its to
  // give back (a card opened by pointer with focus left on the page took none).
  const held = useRef(false);
  useEffect(() => {
    if (!shown || typeof document === "undefined") return;
    const card = cardRef.current as unknown as HTMLElement | null;
    const trigger = triggerRef.current as unknown as HTMLElement | null;
    if (!card || !trigger || typeof card.contains !== "function") return;
    const onFocusIn = () => { held.current = true; };
    if (card.contains(document.activeElement)) held.current = true;
    card.addEventListener("focusin", onFocusIn);
    const unbridge = bridgeTabOrder(card, trigger, leaves ? () => leave.current?.() : undefined, trap);
    return () => {
      card.removeEventListener("focusin", onFocusIn);
      unbridge();
    };
  }, [shown, cardRef, triggerRef, leaves, trap]);
  // What had focus when the card opened (before the owner moves focus in at onCardMount,
  // a passive effect this layout effect precedes), and the card's node, kept past the
  // ref's detachment for the close below.
  const opener = useRef<Element | null>(null);
  const lastCard = useRef<HTMLElement | null>(null);
  useIsomorphicLayoutEffect(() => {
    opener.current = typeof document === "undefined" ? null : document.activeElement;
  }, []);
  useIsomorphicLayoutEffect(() => {
    if (cardRef.current) lastCard.current = cardRef.current as unknown as HTMLElement;
  });
  const restoring = useRef(restore);
  restoring.current = restore;
  useEffect(() => () => {
    if (typeof document === "undefined" || !held.current || !restoring.current) return;
    restoreOrphanedFocus(lastCard.current, returnRef.current as unknown as HTMLElement | null, opener.current);
  }, [returnRef]);
}
