import { createFeed } from "./feeds.shared.js";
import { androidSkin } from "./feeds.styles.js";
import { Avatar as AvatarAndroid } from "../../atoms/avatar/avatar.android.js";

// Material 3 Feed. Metro resolves this file on Android; the docs import it for
// preview. The avatar-lead rows compose the M3-styled Avatar (label-tracked
// initials + controlRipple) so the docs 3-up reads native; the literal
// `.android` import is required for the WEB docs preview, where a barrel import
// would resolve the web Avatar into the Android row.
export const Feed = createFeed(androidSkin, AvatarAndroid);
export type { FeedProps, FeedItem } from "./feeds.shared.js";
