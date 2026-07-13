// StackedBar is a "Shared" platform treatment: the implementation is platform-
// neutral, so every platform entry re-exports the same component. The per-OS
// files exist only so the architecture is uniform across the kit.
export { StackedBar } from "./stacked-bar.shared.js";
export type { StackedBarProps } from "./stacked-bar.shared.js";
