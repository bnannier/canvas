import { useEscapeLayer } from "./escape-layer.js";

/** Dismiss the foremost active overlay on web Escape; no document listener on native. */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
  useEscapeLayer(active, onEscape);
}
