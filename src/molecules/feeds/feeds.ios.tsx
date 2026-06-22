import { createFeed } from "./feeds.shared.js";
import { iosSkin } from "./feeds.styles.js";

// iOS (HIG) Feed. Metro resolves this file on iOS; the docs import it for preview.
export const Feed = createFeed(iosSkin);
export type { FeedProps, FeedItem } from "./feeds.shared.js";
