import { createEmptyState } from "./empty-state.shared.js";
import { iosSkin } from "./empty-state.styles.js";

// iOS (HIG) EmptyState. Metro resolves this file on iOS; the docs import it for preview.
export const EmptyState = createEmptyState(iosSkin);
export type { EmptyStateProps } from "./empty-state.shared.js";
