import { createEmptyState } from "./empty-state.shared.js";
import { webSkin } from "./empty-state.styles.js";

// Web EmptyState (the base; Metro falls back to it on native, web bundlers resolve it).
export const EmptyState = createEmptyState(webSkin);
export type { EmptyStateProps } from "./empty-state.shared.js";
