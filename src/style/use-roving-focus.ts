import { useCallback, useRef } from "react";

// Roving-focus keyboard navigation for composite widgets (tablist, radiogroup,
// listbox, menu). The WAI-ARIA pattern: the group is ONE tab stop (the active item
// has tabindex 0, the rest -1), and the arrow keys move focus among the items and
// activate the one focus lands on. This lives here once so Tabs, RadioGroup,
// Listbox, and the Dropdown menu share a single implementation.
//
// Web-only in effect, like useEscapeKey and the Slider's own onKeyDown: react-native-web
// forwards `onKeyDown` to the DOM node and `focusable` to tabIndex, while natively
// there is no onKeyDown to fire and `focusable` only governs hardware-keyboard focus,
// so the same code adds keyboard operability on the web without a render branch or a
// Platform check. It moves DOM focus through refs the caller wires to each item.

type Focusable = { focus?: () => void } | null;

export interface RovingFocusOptions {
  /** Number of items in the group. */
  count: number;
  /** Index of the active/selected item (the single tab stop). */
  active: number;
  /** Move activation (and focus) to `index` when an arrow/Home/End lands on it. */
  onActivate: (index: number) => void;
  /** Which arrows move: horizontal (Left/Right), vertical (Up/Down), or both. Default horizontal. */
  orientation?: "horizontal" | "vertical" | "both";
  /** Flip the horizontal arrows for right-to-left locales (ArrowLeft advances). */
  rtl?: boolean;
  /** Wrap past the ends (default true). */
  loop?: boolean;
}

export interface RovingItemProps {
  /** Native focusability: in the D-pad/hardware-keyboard order only when active. */
  focusable: boolean;
  /** Web tab order: 0 for the active item, -1 for the rest (react-native-web's
   *  Pressable reads `tabIndex` directly and ignores `focusable`). */
  tabIndex: number;
  /** Ref that captures the item's host node so arrows can move focus to it. */
  ref: (node: Focusable) => void;
  /** Web-only key handler; never fires on native. */
  onKeyDown: (event: { key: string; preventDefault: () => void }) => void;
}

export function useRovingFocus(options: RovingFocusOptions): {
  getItemProps: (index: number) => RovingItemProps;
  /** Move DOM focus to an item by index (e.g. focus the first item when a menu opens). */
  focusItem: (index: number) => void;
} {
  const { count, active, onActivate, orientation = "horizontal", rtl = false, loop = true } = options;

  const refs = useRef<Focusable[]>([]);
  // Latch live values so the memoized handlers never go stale without re-subscribing.
  const state = useRef({ count, active, onActivate, orientation, rtl, loop });
  state.current = { count, active, onActivate, orientation, rtl, loop };

  const focusIndex = useCallback((index: number) => {
    refs.current[index]?.focus?.();
  }, []);

  const activate = useCallback(
    (index: number) => {
      const { count: n } = state.current;
      if (index < 0 || index >= n) return;
      state.current.onActivate(index);
      focusIndex(index);
    },
    [focusIndex],
  );

  const move = useCallback(
    (delta: number) => {
      const { count: n, active: a, loop: wrap } = state.current;
      if (n === 0) return;
      let next = a + delta;
      if (wrap) next = (next + n) % n;
      else next = Math.max(0, Math.min(n - 1, next));
      activate(next);
    },
    [activate],
  );

  const onKeyDown = useCallback(
    (event: { key: string; preventDefault: () => void }) => {
      const { orientation: o, rtl: isRtl, count: n } = state.current;
      const horizontal = o === "horizontal" || o === "both";
      const vertical = o === "vertical" || o === "both";
      const forward = horizontal ? (isRtl ? "ArrowLeft" : "ArrowRight") : null;
      const back = horizontal ? (isRtl ? "ArrowRight" : "ArrowLeft") : null;
      switch (event.key) {
        case forward:
          event.preventDefault();
          move(1);
          break;
        case back:
          event.preventDefault();
          move(-1);
          break;
        case "ArrowDown":
          if (!vertical) return;
          event.preventDefault();
          move(1);
          break;
        case "ArrowUp":
          if (!vertical) return;
          event.preventDefault();
          move(-1);
          break;
        case "Home":
          event.preventDefault();
          activate(0);
          break;
        case "End":
          event.preventDefault();
          activate(n - 1);
          break;
        default:
          return;
      }
    },
    [move, activate],
  );

  const getItemProps = useCallback(
    (index: number): RovingItemProps => ({
      focusable: index === active,
      tabIndex: index === active ? 0 : -1,
      ref: (node: Focusable) => {
        refs.current[index] = node;
      },
      onKeyDown,
    }),
    [active, onKeyDown],
  );

  return { getItemProps, focusItem: focusIndex };
}
