import { createCollapsible } from "./collapsible.shared.js";
import { webSkin } from "./collapsible.styles.js";

// Web Collapsible (the base; web bundlers resolve it, Metro falls back to it).
/** A single disclosure: a header that shows and hides one content panel. */
export const Collapsible = createCollapsible(webSkin);
export type { CollapsibleProps } from "./collapsible.shared.js";
