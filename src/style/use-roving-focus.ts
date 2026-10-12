import { useCallback, useRef } from "react";
import { Platform } from "react-native";

// Roving-focus keyboard navigation for composite widgets (tablist, radiogroup,
// listbox, menu). The WAI-ARIA pattern: the group is ONE tab stop (the active item
// has tabindex 0, the rest -1), and the arrow keys move focus among the items and
// activate the one focus lands on. This lives here once so Tabs, RadioGroup,
// Listbox, and the Dropdown menu share a single implementation.
//
// A disabled item is the hook's to skip, so no owner can forget it: the arrows walk past
// it in their direction of travel (wrapping with `loop`, stopping at the end without),
// Home and End take the first and last enabled items, and it is never the tab stop. When
// the active item is itself disabled (a controlled value naming a disabled option), the
// first enabled item is the tab stop and the moves start from it, as a browser's own
// radio group does; with every item disabled a key does nothing.
//
// Roving tab stops apply to the browser runtime. On Android, focusable=false
// also removes Pressable's native click handler, so inactive rows would lose
// TalkBack activation and let hover reach controls behind them. Native rows keep
// focusable=true/tabIndex=0; their owner still supplies disabled when needed.
// The web-only onKeyDown handler moves DOM focus through the registered refs.

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
  /**
   * Whether the item at `index` is disabled: never the tab stop, and the arrows, Home and
   * End skip it. Omit when no item can be disabled.
   */
  isDisabled?: (index: number) => boolean;
}

export interface RovingItemProps {
  /** Only the tab stop is focusable on web; native rows retain click support. */
  focusable: boolean;
  /** Web tab order: 0 for the tab stop (the active item, or the first enabled one when
   * the active item is disabled), -1 for the rest. Native uses 0 for every row so
   * tabIndex does not disable Pressable's native click handler. */
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
  const { count, active, onActivate, orientation = "horizontal", rtl = false, loop = true, isDisabled } = options;

  const refs = useRef<Focusable[]>([]);
  const refSetters = useRef<RovingItemProps["ref"][]>([]);
  // Latch live values so the memoized handlers never go stale without re-subscribing.
  const state = useRef({ count, active, onActivate, orientation, rtl, loop, isDisabled });
  state.current = { count, active, onActivate, orientation, rtl, loop, isDisabled };

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

  // The first enabled index met walking from `from` by `step` (1 or -1), wrapping past
  // the ends when `wrap` is set; -1 when the walk meets none.
  const enabledFrom = useCallback((from: number, step: 1 | -1, wrap: boolean) => {
    const { count: n, isDisabled: disabledAt } = state.current;
    for (let taken = 0; taken < n; taken++) {
      let i = from + step * taken;
      if (wrap) i = ((i % n) + n) % n;
      else if (i < 0 || i >= n) return -1;
      if (!disabledAt?.(i)) return i;
    }
    return -1;
  }, []);

  const move = useCallback(
    (delta: 1 | -1) => {
      const { count: n, active: a, loop: wrap } = state.current;
      if (n === 0) return;
      // A disabled (or out-of-range) active item hands the tab stop, and the walk's
      // start, to the first enabled item.
      const from = a >= 0 && a < n && !state.current.isDisabled?.(a) ? a : enabledFrom(0, 1, false);
      if (from === -1) return;
      const next = enabledFrom(from + delta, delta, wrap);
      if (next !== -1) activate(next);
    },
    [activate, enabledFrom],
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
        case "Home": {
          event.preventDefault();
          const first = enabledFrom(0, 1, false);
          if (first !== -1) activate(first);
          break;
        }
        case "End": {
          event.preventDefault();
          const last = enabledFrom(n - 1, -1, false);
          if (last !== -1) activate(last);
          break;
        }
        default:
          return;
      }
    },
    [move, activate, enabledFrom],
  );

  // The group's single tab stop: the active item, or the first enabled one when the
  // active item is disabled; none when every item is.
  const stop = active >= 0 && active < count && !isDisabled?.(active)
    ? active
    : Array.from({ length: count }, (_, i) => i).find((i) => !isDisabled?.(i)) ?? -1;

  const getItemProps = useCallback(
    (index: number): RovingItemProps => {
      // Selection updates tab order, not host identity. Keep each registration
      // stable so composing it with a consumer ref does not reattach that ref.
      refSetters.current[index] ??= (node) => {
        refs.current[index] = node;
      };
      return {
        ...Platform.select({
          web: { focusable: index === stop, tabIndex: index === stop ? 0 : -1 },
          default: { focusable: true, tabIndex: 0 },
        }),
        ref: refSetters.current[index],
        onKeyDown,
      };
    },
    [stop, onKeyDown],
  );

  return { getItemProps, focusItem: focusIndex };
}
