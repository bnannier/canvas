// The standard field width axis shared by the input-like controls (Input,
// Textarea, Select, Combobox, Field). A bare field RENDERS AT the standard
// width on desktop so stacked fields share one edge, and the standard drops at
// the `sm` breakpoint and below, where a field fills its container (the phone
// form factor).
//
// The style is `{ width: <standard>, maxWidth: "100%" }`, overriding the
// skins' `width:"100%"`: the explicit width is what standardizes fields in
// content-sized contexts (a centered stage, a row), where `width:"100%"` plus
// a max-width cap would collapse to the placeholder text's natural width; the
// `maxWidth:"100%"` keeps the field shrinking inside narrower parents.
//
// A composing layout that wants to govern width itself (Form columns, dialog
// bodies, Fieldset) passes `block` to its inner control, which restores the
// skin's fill-the-container `width:"100%"`.

import type { ViewStyle } from "react-native";
import { fieldWidths } from "./tokens.js";
import { useResponsive } from "./responsive.js";

/** The width axis common to the input-like controls. Pick at most one. */
export interface FieldWidthProps {
  /** Fill the container instead of the standard width (default 320px on desktop). Wins over narrow/wide. */
  block?: boolean;
  /** Compact field: 240px instead of the standard 320px, for toolbars and short values. Fills the container at the sm breakpoint and below. */
  narrow?: boolean;
  /** Roomy field: 480px instead of the standard 320px, for long values and multiline entry. Fills the container at the sm breakpoint and below. */
  wide?: boolean;
}

/**
 * Resolve the width axis to the style a field's outermost element appends
 * after its skin styles: `{ width, maxWidth:"100%" }` on desktop, `null` when
 * the field fills its container (`block`, or any viewport at the `sm`
 * breakpoint and below, where the skin's `width:"100%"` applies). Precedence
 * when several are passed: block > narrow > wide > default.
 */
export function useFieldWidth(p: FieldWidthProps): ViewStyle | null {
  const std = p.block ? null : p.narrow ? fieldWidths.narrow : p.wide ? fieldWidths.wide : fieldWidths.base;
  // The `sm` entry must be `null`, not `undefined`: `responsive()` skips
  // undefined entries, and the standard would never drop on phones.
  return useResponsive<ViewStyle | null>({
    base: std != null ? { width: std, maxWidth: "100%" } : null,
    sm: null,
  });
}
