import { Children, type ReactNode } from "react";
import { RevealOrdinalContext } from "./reveal-context.js";

// RevealGroup: stagger as STRUCTURE. It wraps a set of Reveals and hands each one the
// next ordinal in document order, and the Reveal converts that ordinal into its own
// start delay. This is the reason the Reveal API can stay boolean-only: the thing a
// call site actually wants ("these cards should arrive one after another") is
// expressed by nesting them in a group, not by computing a delay per item and
// passing it down as a number.
//
// IT RENDERS NO HOST ELEMENT, and that is load-bearing rather than tidiness. Grids
// lay out their DIRECT children; any box this component introduced would become the
// single grid item and collapse the whole set into one cell. So the group is exactly
// a fragment of context providers: a provider is not a host element, it produces no
// View, no layout box, and no style, which means a group can sit between a grid
// container and its items and change nothing about the layout.
//
// ORDINALS ARE ASSIGNED BY POSITION, not by mount order. Children.map walks the
// children in document order at render time, so ordinals are deterministic, stable
// across re-renders, correct on the very first frame (before any effect has run), and
// unaffected by a double-invoked render or effect in development. A counter claimed
// from an effect would have none of those properties.
//
// The consequence to know: an ordinal belongs to a DIRECT child. A Reveal nested
// deeper inside one child inherits that child's ordinal rather than getting its own,
// and a direct child that is not a Reveal still consumes an ordinal. Both follow from
// "position in this group" being the definition, and the shape the group exists for
// (a mapped list of Reveals) has neither problem.
//
// Skin-free by nature (it draws nothing at all), so there is one shared
// implementation for iOS, Android, and web, exactly like RadioGroup.

export interface RevealGroupProps {
  /**
   * The Reveals to stagger. Each direct child receives the next ordinal in document
   * order, so a mapped list arrives one item after another with no per-item props.
   */
  children?: ReactNode;
}

export function RevealGroup({ children }: RevealGroupProps) {
  return (
    <>
      {Children.map(children, (child, ordinal) => (
        // The value is a plain number, so this provider re-renders its subtree only
        // when the child's position actually changes.
        <RevealOrdinalContext.Provider value={ordinal}>{child}</RevealOrdinalContext.Provider>
      ))}
    </>
  );
}
