import { useCallback, useRef, useState } from "react";

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
// the mode is latched from the first render (switching modes mid-life is a
// consumer bug React itself warns about; we keep the initial mode).

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

  const value = isControlled && controlled !== undefined ? controlled : internal;

  const setValue = useCallback(
    (next: T) => {
      if (!isControlled) setInternal(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  return [value, setValue];
}
