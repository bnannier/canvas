import { createFeed } from "./feeds.shared.js";
import { webSkin } from "./feeds.styles.js";

// Web Feed (the base; Metro falls back to it on native, web bundlers resolve it).
// Composes the web base Avatar by default (createFeed's default) for the
// avatar-lead rows.
export const Feed = createFeed(webSkin);
export type { FeedProps, FeedItem } from "./feeds.shared.js";
