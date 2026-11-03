import { createContext, useContext } from "react";
import type { AnatomyTarget } from "../../style/anatomy.js";

// The anatomy parts a Field hands down with its label (src/molecules/field). When Field
// delegates its label into a label-owning control (Input, Textarea, Select, Autocomplete,
// PhoneInput), that control draws the label, its star and the box Field calls its
// "Label", "Required mark" and "Control", inside Field's AnatomyScope where the control's own parts register nothing.
// So Field takes those parts' handlers above its scope and provides them here, around
// the delegated control only; the control attaches them to its label Text, its field box
// and its label's star ("Required mark"). Outside an AnatomyProvider Field provides nothing and this costs one context read.

/** Field's "Label", "Control" and "Required mark" handlers, for the control its label was delegated into. */
export interface DelegatedParts {
  label?: AnatomyTarget;
  control?: AnatomyTarget;
  required?: AnatomyTarget;
}

export const DelegatedPartsContext = createContext<DelegatedParts | null>(null);

/** The parts a Field delegated into this control with its label, null when none did. */
export function useDelegatedParts(): DelegatedParts | null {
  return useContext(DelegatedPartsContext);
}
