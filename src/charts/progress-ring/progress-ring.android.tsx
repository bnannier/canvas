// ProgressRing is a "Shared" platform treatment: the implementation is
// platform-neutral, so every platform entry re-exports the same component.
// The per-OS files exist only so the architecture is uniform across the kit.
export { ProgressRing } from "./progress-ring.shared.js";
export type { ProgressRingProps } from "./progress-ring.shared.js";
