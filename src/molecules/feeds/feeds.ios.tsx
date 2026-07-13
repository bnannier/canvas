import { createFeed } from "./feeds.shared.js";
import { iosSkin } from "./feeds.styles.js";
import { Avatar as AvatarIOS } from "../../atoms/avatar/avatar.ios.js";

// iOS (HIG) Feed. Metro resolves this file on iOS; the docs import it for
// preview. The avatar-lead rows compose the iOS-styled Avatar (600-weight
// SF-tracked initials on a Liquid Glass fallback) so the docs 3-up reads native;
// the literal `.ios` import is required for the WEB docs preview, where a barrel
// import would resolve the web Avatar into the iOS row.
export const Feed = createFeed(iosSkin, AvatarIOS);
export type { FeedProps, FeedItem } from "./feeds.shared.js";
