import { createSkeleton } from "./skeleton.shared.js";
import { iosSkin } from "./skeleton.styles.js";

// iOS (HIG) Skeleton. Metro resolves this file on iOS; the docs import it for preview.
// Shared treatment: iOS has no native skeleton control, so this matches the web look.
export const Skeleton = createSkeleton(iosSkin);
export type { SkeletonProps } from "./skeleton.shared.js";
