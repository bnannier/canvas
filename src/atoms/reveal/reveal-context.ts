import { createContext, useContext } from "react";

// The stagger channel between RevealGroup and the Reveals inside it. The group hands
// each of its children an ORDINAL (0, 1, 2, ...) and nothing else; the Reveal turns
// that ordinal into its own start delay from its skin. Splitting it this way is what
// keeps the public API free of numbers: "third in this group" is structural
// information the tree already has, so the call site never writes a delay.
//
// Kept in its own module (the radio-context.ts precedent) because both the group and
// the per-platform Reveal builds need it, and a shared context must be one module
// instance: importing it from either component file would give the .ios / .android /
// web builds three different contexts.
//
// Default 0: a Reveal with no RevealGroup above it is simply first, so it plays
// immediately. That makes a lone <Reveal> useful on its own with no provider.

export const RevealOrdinalContext = createContext(0);

/** This Reveal's position within its RevealGroup, or 0 when it stands alone. */
export function useRevealOrdinal(): number {
  return useContext(RevealOrdinalContext);
}
