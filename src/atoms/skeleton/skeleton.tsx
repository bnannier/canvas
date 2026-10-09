import { createSkeleton } from "./skeleton.shared.js";
import { webSkin } from "./skeleton.styles.js";

// Web Skeleton (the base; Metro falls back to it on native, web bundlers resolve it).
// Skeleton is a "Shared" treatment, so iOS and Android render this same look.
/** A placeholder shape for content that is still loading. */
export const Skeleton = createSkeleton(webSkin);
export type { SkeletonProps } from "./skeleton.shared.js";
