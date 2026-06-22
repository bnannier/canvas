import { createDescriptionList } from "./description-lists.shared.js";
import { iosSkin } from "./description-lists.styles.js";

// iOS (HIG / SwiftUI LabeledContent) DescriptionList. Metro resolves this file
// on iOS; the docs import it for preview.
export const DescriptionList = createDescriptionList(iosSkin);
export type { DescriptionListProps, DescriptionListItem } from "./description-lists.shared.js";
