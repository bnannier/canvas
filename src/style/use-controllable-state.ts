import { useCallback, useRef, useState } from "react";
import { devWarn } from "./dev-warn.js";
import { useIsomorphicLayoutEffect } from "./use-isomorphic-layout-effect.js";

// Controlled + uncontrolled duality, the standard library-component contract:
//   <Switch value={on} onValueChange={setOn} />   controlled (parent owns state)
//   <Switch defaultValue onValueChange={log} />   uncontrolled (component owns it)
//   <Switch />                                    uncontrolled, interactive out of the box
//
// The audit found the kit split-brained here: disclosure components supported
// both patterns while every form control was controlled-only (a bare <Switch />
// was inert). This hook gives every component one implementation of the
// contract: the controlled prop wins when provided (undefined = uncontrolled,
// matching React's own input semantics), the change callback always fires, and
// the mode is latched from the first render.
//
// Switching modes mid-life is a consumer bug React itself warns about, and the hook
// keeps the initial mode, warning once in development either way. A controlled
// component whose prop is cleared to undefined keeps showing the LAST value its parent
// gave it, as React's own controlled input does, never the value it mounted with; an
// uncontrolled one that is later given a value keeps its own state. The hook never
// returns undefined for a T that cannot hold it: an explicit empty value is the
// component's own API to offer (a `null`), not this hook's.

/**
 * One component's value, controlled by its parent or held by the component itself: the
 * mode is latched at mount (a `controlled` value then means controlled), the change
 * callback fires in both modes, and a controlled value cleared to undefined keeps the
 * last one the parent gave. Returns the value to render and the setter a press calls.
 */
export function useControllableState<T>(
  /** The controlled value; undefined means "uncontrolled". */
  controlled: T | undefined,
  /** Initial value for uncontrolled use. */
  defaultValue: T,
  /** Change callback, fired in BOTH modes. */
  onChange?: (next: T) => void,
): [T, (next: T) => void] {
  const isControlled = useRef(controlled !== undefined).current;
  const [internal, setInternal] = useState<T>(
    controlled !== undefined ? controlled : defaultValue,
  );

  // The last controlled value a render committed, so a parent that clears its prop to
  // undefined leaves the component where it last put it. Written after commit, so a
  // render React throws away never becomes the value shown.
  const lastControlled = useRef<T>(internal);
  useIsomorphicLayoutEffect(() => {
    if (isControlled && controlled !== undefined) lastControlled.current = controlled;
  }, [isControlled, controlled]);

  devWarn(
    isControlled && controlled === undefined,
    "[canvas] useControllableState: a controlled component's value became undefined. It stays controlled and keeps the last value its parent gave; keep passing a value, or render it uncontrolled (defaultValue) from the start.",
  );
  devWarn(
    !isControlled && controlled !== undefined,
    "[canvas] useControllableState: an uncontrolled component was given a value after it mounted. It keeps its own state and ignores the value; pass the value from the first render, or remount it (a new key) to switch modes.",
  );

  const value = isControlled ? (controlled !== undefined ? controlled : lastControlled.current) : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
