import { useCallback, useRef, useState } from "react";
import { useRovingFocus } from "./use-roving-focus.js";
import { isRTL } from "./rtl.js";
import { focusInto, type FocusNode } from "./accessibility-focus.js";

// The rows of an anchored menu or option list (Dropdown, RowMenu, SplitButton's overflow
// menu, Select, the PhoneInput country list): the WAI-ARIA menu and listbox keyboard
// model on the web, and the screen reader moved in natively. The rows are one tab stop
// that the arrow keys, Home and End move among (roving focus, src/style/use-roving-focus.ts),
// Enter and Space activate the focused row, and when the card is revealed focus enters at
// the row the owner names (the first enabled action, the selected option): DOM focus on
// the web, VoiceOver's and TalkBack's natively. Tab out of the card closes it
// (AnchoredOverlay's `dismissOnTab`), and the card gives focus back to its trigger.

/** A web key event, as react-native-web hands it to a row (RN's types omit onKeyDown). */
export interface RowKeyEvent { key: string; preventDefault: () => void }

/** What a row spreads onto its Pressable (the key handler rides a cast: RN's types omit it). */
export interface RowFocusProps {
  ref: (node: FocusNode) => void;
  focusable: boolean;
  tabIndex: number;
  onKeyDown: (event: RowKeyEvent) => void;
}

export function useRowFocus(count: number): {
  /** Move focus into row `index` (call it from AnchoredOverlay's onCardMount). */
  enter: (index: number) => void;
  /**
   * The focus props for row `index`; `activate` runs on Enter and Space with the key
   * event (what react-native-web itself hands a Pressable's onPress for a key press).
   */
  rowProps: (index: number, activate: (event: RowKeyEvent) => void) => RowFocusProps;
} {
  const [active, setActive] = useState(0);
  const nodes = useRef<FocusNode[]>([]);
  const { getItemProps } = useRovingFocus({ count, active, onActivate: setActive, orientation: "vertical", rtl: isRTL() });
  const enter = useCallback((index: number) => {
    const row = Math.max(0, Math.min(count - 1, index));
    setActive(row);
    focusInto(nodes.current[row]);
  }, [count]);
  const rowProps = (index: number, activate: (event: RowKeyEvent) => void): RowFocusProps => {
    const roving = getItemProps(index);
    return {
      // One ref feeding two readers: the roving hook (arrow moves) and the node table
      // the entry reads.
      ref: (node) => {
        roving.ref(node ?? null);
        nodes.current[index] = node;
      },
      focusable: roving.focusable,
      tabIndex: roving.tabIndex,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(event);
          return;
        }
        roving.onKeyDown(event);
      },
    };
  };
  return { enter, rowProps };
}
