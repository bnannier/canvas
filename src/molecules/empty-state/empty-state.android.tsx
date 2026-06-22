import { createEmptyState } from "./empty-state.shared.js";
import { androidSkin } from "./empty-state.styles.js";

// Material 3 EmptyState. Metro resolves this file on Android; the docs import it for preview.
export const EmptyState = createEmptyState(androidSkin);
export type { EmptyStateProps } from "./empty-state.shared.js";
