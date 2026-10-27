import { createContext, useContext } from "react";
import { type RovingItemProps } from "../../style/index.js";

// Shared context that lets a ChipGroup own a pick-one set's state and a child Chip read
// it, the way RadioGroup hands its value to each Radio. A `<Chip value="…">` inside a
// ChipGroup is one option of the set: it shows as selected when the group's value is
// its own, selects that value on press, reads as a radio to assistive tech, and takes
// the group's roving tab stop. A Chip with no surrounding group, or with no `value`,
// keeps its own `selectable` / `selected` behavior.

export interface ChipGroupContextValue {
  /** The value of the chosen chip. */
  value: string | number | undefined;
  /** Choose a chip's value (called by a child Chip on press). */
  select: (value: string | number) => void;
  /** When true, every chip in the group is disabled. */
  disabled?: boolean;
  /** Roving-focus props for the chip with this value (the group's arrow keys); undefined
   *  when the group is disabled or the value is not one of its options. */
  itemProps?: (value: string | number) => RovingItemProps | undefined;
}

export const ChipGroupContext = createContext<ChipGroupContextValue | null>(null);

/** Read the enclosing ChipGroup, or null for a Chip used on its own. */
export function useChipGroup(): ChipGroupContextValue | null {
  return useContext(ChipGroupContext);
}
