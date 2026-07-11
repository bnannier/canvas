// The standard field width axis shared by the input-like controls (Input,
// Textarea, Select, Combobox, Field). A bare field caps at the standard width
// on desktop so stacked fields share one right edge, and the cap drops at the
// `sm` breakpoint and below, where a field fills its container (the phone
// form factor). The cap is a max-width on top of the skins' `width:"100%"`,
// so fields still shrink inside narrower parents.
//
// A composing layout that wants to govern width itself (Form columns, dialog
// bodies, Fieldset) passes `block` to its inner control.

import type { ViewStyle } from "react-native";
import { fieldWidths } from "./tokens.js";
import { useResponsive } from "./responsive.js";

/** The width axis common to the input-like controls. Pick at most one. */
export interface FieldWidthProps {
  /** Fill the container: removes the standard max-width cap (default 320px on desktop). Wins over narrow/wide. */
  block?: boolean;
  /** Compact field: a 240px cap instead of the standard 320px, for toolbars and short values. Full width at the sm breakpoint and below. */
  narrow?: boolean;
  /** Roomy field: a 480px cap instead of the standard 320px, for long values and multiline entry. Full width at the sm breakpoint and below. */
  wide?: boolean;
}

/**
 * Resolve the width axis to the style a field's outermost element appends
 * after its skin styles: `{ maxWidth }` on desktop, `null` when the field
 * fills its container (`block`, or any viewport at the `sm` breakpoint and
 * below). Precedence when several are passed: block > narrow > wide > default.
 */
export function useFieldWidth(p: FieldWidthProps): ViewStyle | null {
  const cap = p.block ? null : p.narrow ? fieldWidths.narrow : p.wide ? fieldWidths.wide : fieldWidths.base;
  // The `sm` entry must be `null`, not `undefined`: `responsive()` skips
  // undefined entries, and the cap would never drop on phones.
  return useResponsive<ViewStyle | null>({ base: cap != null ? { maxWidth: cap } : null, sm: null });
}
