import { createSkeleton } from "./skeleton.shared.js";
import { androidSkin } from "./skeleton.styles.js";

// Material 3 Skeleton. Metro resolves this file on Android; the docs import it for preview.
// Shared treatment: M3 documents skeleton loaders only as a motion pattern, no component,
// so this matches the web look.
export const Skeleton = createSkeleton(androidSkin);
export type { SkeletonProps } from "./skeleton.shared.js";
