import { useEffect, useRef } from "react";

// Escape-to-dismiss for anchored overlays (Dropdown, Popover, Select, Combobox,
// RowMenu). While `active`, a document-level keydown listener catches Escape on
// the web and calls `onEscape` (close the overlay) no matter where focus sits:
// the trigger, an option row, or nowhere at all. Natively there is no `document`
// (and no hardware-Escape convention; Android back is the navigation layer's
// concern), so the hook is a no-op there. This is additive web-only EVENT
// handling, not a web-only rendering branch, so it stays inside the kit's
// cross-platform rules.

export function useEscapeKey(
  /** Subscribe only while true (pass the overlay's open state). */
  active: boolean,
  /** Called when Escape is pressed while active. */
  onEscape: () => void,
): void {
  // Latch the latest callback so the listener never re-subscribes when the
  // caller passes a fresh closure each render (the usual `() => setOpen(false)`).
  const callback = useRef(onEscape);
  callback.current = onEscape;

  useEffect(() => {
    if (!active || typeof document === "undefined") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") callback.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [active]);
}
