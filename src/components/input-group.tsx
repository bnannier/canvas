import { Input, type InputProps } from "./input.js";

// InputGroup has been folded into Input: an input with attached addons (a
// leading prefix, a trailing suffix, overlaid icons, or a pressable action) is
// now just `<Input prefix=… suffix=… action … />`. Input renders the grouped
// layout whenever any addon prop is present, so there is no separate component
// to compose. This alias is kept so existing `<InputGroup …/>` call sites keep
// working unchanged.

/**
 * @deprecated Use `Input` with its addon props (`prefix`, `suffix`,
 * `leadingIcon`, `trailingIcon`, `icon`, `action`, `onActionPress`). The props
 * are identical, so `<InputGroup …/>` can be renamed to `<Input …/>` directly.
 */
export type InputGroupProps = InputProps;

/**
 * @deprecated Use `Input` with its addon props instead. Kept as an alias for
 * backward compatibility; it will be removed in a future major version.
 */
export const InputGroup = Input;
