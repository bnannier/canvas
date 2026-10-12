import type { TargetRejectedEvent } from "./index";

/**
 * The refusal handler for the host a frost names now. A report about a host it no longer
 * names (its ref moved on before the event arrived) is not news about the current one,
 * so it is dropped; with no handler there is nothing to forward.
 */
export function forCurrentTarget(
  targetId: number | null,
  onTargetRejected?: (event: TargetRejectedEvent) => void,
): ((event: TargetRejectedEvent) => void) | undefined {
  if (!onTargetRejected) return undefined;
  return (event) => {
    if (event.nativeEvent.targetId === targetId) onTargetRejected(event);
  };
}
