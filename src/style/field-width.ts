// The standard field width axis shared by the input-like controls (Input,
// Textarea, Select, Autocomplete, Field). A bare field RENDERS AT the standard
// width at every viewport so stacked fields share one edge; `maxWidth:"100%"`
// shrinks it inside narrower parents (which is all a phone screen is).
//
// The style is `{ width: <standard>, maxWidth: "100%" }`, overriding the
// skins' `width:"100%"`: the explicit width is what standardizes fields in
// content-sized contexts (a centered stage, a row), where `width:"100%"` plus
// a max-width cap would collapse to the placeholder text's natural width. The
// width must hold on EVERY form factor: an earlier revision dropped it at the
// `sm` breakpoint ("phones fill"), which put phones back on width:"100%", and
// in a content-sized context the field then resized to hug the typed value on
// every keystroke (the placeholder sizes it while empty; the first character
// shrinks it).
//
// A composing layout that wants to govern width itself (Form columns, dialog
// bodies, Field) passes `block` to its inner control, which restores the
// skin's fill-the-container `width:"100%"`.

import type { ViewStyle } from "react-native";
import { fieldWidths } from "./tokens.js";

/** The width axis common to the input-like controls. Pick at most one. */
export interface FieldWidthProps {
  /** Fill the container instead of the standard width (default 320px). Wins over fit/narrow/wide. */
  block?: boolean;
  /** Hug the content: the field shrinks to its own value/label instead of a fixed width, for a toolbar cluster. */
  fit?: boolean;
  /** Compact field: 240px instead of the standard 320px, for toolbars and short values. */
  narrow?: boolean;
  /** Roomy field: 480px instead of the standard 320px, for long values and multiline entry. */
  wide?: boolean;
}

/**
 * Resolve the width axis to the style a field's outermost element appends
 * after its skin styles: `{ width, maxWidth:"100%" }`, `{ width:"auto", maxWidth:"100%" }`
 * for `fit` (the field hugs its content instead of a fixed width, overriding the
 * skin's `width:"100%"`), or `null` for `block`, where the skin's fill-the-container
 * `width:"100%"` applies. Precedence when several are passed:
 * block > fit > narrow > wide > default. (Named use* for API stability; it currently
 * needs no hook state.)
 */
export function useFieldWidth(p: FieldWidthProps): ViewStyle | null {
  if (p.block) return null;
  if (p.fit) return { width: "auto", maxWidth: "100%" };
  const std = p.narrow ? fieldWidths.narrow : p.wide ? fieldWidths.wide : fieldWidths.base;
  return { width: std, maxWidth: "100%" };
}
