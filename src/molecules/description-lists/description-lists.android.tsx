import { createDescriptionList } from "./description-lists.shared.js";
import { androidSkin } from "./description-lists.styles.js";

// Material 3 DescriptionList. Metro resolves this file on Android; the docs
// import it for preview.
export const DescriptionList = createDescriptionList(androidSkin);
export type { DescriptionListProps, DescriptionListItem } from "./description-lists.shared.js";
