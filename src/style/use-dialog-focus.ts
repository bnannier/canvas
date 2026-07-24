import { useEffect, useRef } from "react";
import { type View } from "react-native";

// Focus management for modal dialogs (Dialog, AlertDialog). A modal takes over
// the page while it is open, so on the web it must: move focus INTO the panel on
// open (WAI-ARIA: focus the dialog so a keyboard/AT user lands inside it), keep
// Tab / Shift+Tab cycling within the panel (a focus trap, so focus can't wander
// to the inert page behind the backdrop), and RESTORE focus to whatever was
// focused before (the trigger) when it closes. Attach the returned ref to the
// panel container (a focusable `tabIndex={-1}` View) and pass the open state.
//
// This is additive web-only EVENT handling (a keydown listener bound to the panel
// node, which RNW renders as a real DOM element), not a web-only rendering
// branch, so it stays inside the kit's cross-platform rules. Natively there is no
// `document` (VoiceOver/TalkBack scope the modal via accessibilityViewIsModal),
// so the whole effect is a no-op there and never touches a DOM global.

// The interactive descendants Tab visits: links, form controls, and anything
// explicitly made tabbable. Disabled controls and `tabindex="-1"` nodes (the
// panel container itself, decorative focus targets) are filtered out below.
const FOCUSABLE_SELECTOR =
  'a[href], button, input, select, textarea, [tabindex]';

export function useDialogFocus(
  /** Run the focus management only while the dialog is open. */
  open: boolean,
) {
  const panelRef = useRef<View>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    // RNW renders the panel View as a DOM element, so the ref is an HTMLElement
    // at runtime; bridge the RN ref type to it for the DOM-only focus work.
    const panel = panelRef.current as unknown as HTMLElement | null;
    if (panel == null) return;

    // Remember what had focus (the trigger), then pull focus into the panel.
    // `preventScroll`: moving focus into the panel must NOT scroll the panel's
    // nearest scrollable ancestor into view. A modal overlays the page (it is
    // portaled/fixed and already visible), and a `<Dialog open>` rendered inline
    // in a docs demo sits mid-page; without this flag the browser yanks the
    // surrounding ScrollView to the panel on every open. Every programmatic focus
    // move below passes it for the same reason.
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panel.focus({ preventScroll: true });

    // Trap: keep Tab / Shift+Tab inside the panel, wrapping last->first and
    // first->last so focus never leaves the modal while it is open.
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("tabindex") !== "-1",
      );
      if (focusables.length === 0) {
        // Nothing to land on: keep focus pinned to the panel itself.
        event.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement;
      if (event.shiftKey) {
        // Backward off the first control (or the panel container) wraps to last.
        if (active === first || active === panel || !panel.contains(active)) {
          event.preventDefault();
          last.focus({ preventScroll: true });
        }
      } else if (active === last) {
        // Forward off the last control wraps to first.
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };
    panel.addEventListener("keydown", onKeyDown);

    return () => {
      panel.removeEventListener("keydown", onKeyDown);
      // Return focus to the trigger (or wherever it was) as the dialog closes.
      // `preventScroll` so the restore never yanks the page: the trigger is
      // normally already in view when a user dismisses the dialog.
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return panelRef;
}

// Lighter focus handling for a NON-MODAL popover: move focus into the panel on open
// and restore it to the trigger on close, WITHOUT trapping Tab. A popover does not
// take over the page (Escape or an outside tap dismisses it, and Tab may leave it),
// so it only needs the move-in / restore-out halves, not the trap. Attach the
// returned ref to a focusable `tabIndex={-1}` panel container and pass the open
// state. No-op natively and during SSR (guarded on `document`), like useDialogFocus.
export function usePopoverFocus(open: boolean) {
  const panelRef = useRef<View>(null);

  useEffect(() => {
    if (!open || typeof document === "undefined") return;
    const panel = panelRef.current as unknown as HTMLElement | null;
    if (panel == null) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    panel.focus({ preventScroll: true });
    return () => {
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [open]);

  return panelRef;
}
