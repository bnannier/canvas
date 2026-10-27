import { createContext, useContext, useMemo, type ReactNode } from "react";

// The pinned interaction states behind InteractionOverride: a docs specimen (a component
// page's States row) or a visual test shows a control hovered, keyboard-focused or held
// down without a pointer or a keyboard. The kit's three interaction primitives read it:
// `useHover` (src/style/hover.tsx) reports a pinned hover, the kit's Pressable
// (src/style/pressable.tsx) draws its focus ring and reports `pressed` to its style and
// children functions, and a frame's ring (src/style/focus-frame.tsx) shows. So every
// control that takes its hover, focus ring or press state from those primitives honours
// the pin with no prop of its own.
//
// It is BreakpointOverride's seam for interaction: a context whose null default costs a
// context read and nothing else, and a pinned state is a value the style switches on,
// never a timer or a per-frame commit. The nearest provider wins outright (an inner one
// with no flag gives its subtree back the real states), so a States row can pin each
// specimen in its own cell. A control the pin reaches still honours `disabled`: a
// disabled control is never shown hovered, focused or pressed, as a pointer or a key
// could not make it so.

/** The interaction states a subtree resolves as pinned. */
export interface PinnedInteraction {
  hovered: boolean;
  focused: boolean;
  pressed: boolean;
}

const InteractionOverrideContext = createContext<PinnedInteraction | null>(null);

/** The pinned interaction states from the nearest InteractionOverride, or null outside one. */
export function useInteractionOverride(): PinnedInteraction | null {
  return useContext(InteractionOverrideContext);
}

/**
 * Whether an InteractionOverride pins keyboard focus on a control that paints a focus
 * look of its own (a field's `ring` border) instead of the Pressable's ring, while
 * `enabled` (the control can take focus at all). The control ORs it into its own focus
 * state.
 */
export function usePinnedFocus(enabled = true): boolean {
  const pinned = useContext(InteractionOverrideContext);
  return enabled && (pinned?.focused ?? false);
}

export interface InteractionOverrideProps {
  /** Every kit control in the subtree renders as if a pointer hovered it. */
  hovered?: boolean;
  /** Every kit control in the subtree renders its keyboard focus (the focus ring, or the field's own focused look). */
  focused?: boolean;
  /** Every kit control in the subtree renders as if it were held down. */
  pressed?: boolean;
  /** The subtree that resolves the pinned states. */
  children?: ReactNode;
}

/**
 * Pins hover, keyboard focus or the pressed state for every kit control in its subtree,
 * so a docs specimen or a visual test can show that state without a pointer or a key:
 * `<InteractionOverride hovered><Button>Save</Button></InteractionOverride>`. The flags
 * combine (`hovered pressed`). Passing none gives the subtree back its real states, so an
 * inner provider can unpin a cell of a pinned region. It renders only a context provider:
 * no view, nothing painted, nothing in the accessibility tree.
 *
 * Three things to know:
 * - It pins the look, not the behaviour. Nothing is focused or pressed for real: no
 *   `onPress`, `onFocus` or `onHoverIn` fires, and assistive technology hears the
 *   control as it is.
 * - A disabled control stays at rest under any pin.
 * - Portaled overlay content (menus, dialogs, toasts) is outside the subtree and keeps
 *   its real states.
 */
export function InteractionOverride({ hovered, focused, pressed, children }: InteractionOverrideProps): ReactNode {
  const value = useMemo(
    (): PinnedInteraction | null => (hovered || focused || pressed ? { hovered: !!hovered, focused: !!focused, pressed: !!pressed } : null),
    [hovered, focused, pressed],
  );
  return <InteractionOverrideContext.Provider value={value}>{children}</InteractionOverrideContext.Provider>;
}
