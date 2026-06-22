import { createDescriptionList } from "./description-lists.shared.js";
import { webSkin } from "./description-lists.styles.js";

// Web DescriptionList (the base; Metro falls back to it on native, web bundlers
// resolve it). The established Canvas / Catalyst term-value list look.
export const DescriptionList = createDescriptionList(webSkin);
export type { DescriptionListProps, DescriptionListItem } from "./description-lists.shared.js";
