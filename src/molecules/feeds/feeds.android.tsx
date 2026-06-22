import { createFeed } from "./feeds.shared.js";
import { androidSkin } from "./feeds.styles.js";

// Material 3 Feed. Metro resolves this file on Android; the docs import it for preview.
export const Feed = createFeed(androidSkin);
export type { FeedProps, FeedItem } from "./feeds.shared.js";
