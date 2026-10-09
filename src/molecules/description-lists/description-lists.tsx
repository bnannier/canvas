import { createDescriptionList } from "./description-lists.shared.js";
import { webSkin } from "./description-lists.styles.js";

// Web DescriptionList (the base; Metro falls back to it on native, web bundlers
// resolve it). The Catalyst term-value list look.
/** Term and value pairs in stacked, two-column or inline-edit layouts. */
export const DescriptionList = createDescriptionList(webSkin);
export type { DescriptionListProps, DescriptionListItem, DescriptionListAvatar } from "./description-lists.shared.js";
