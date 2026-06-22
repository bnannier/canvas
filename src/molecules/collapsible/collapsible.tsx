import { createCollapsible } from "./collapsible.shared.js";
import { webSkin } from "./collapsible.styles.js";

// Web Collapsible (the base; web bundlers resolve it, Metro falls back to it).
export const Collapsible = createCollapsible(webSkin);
export type { CollapsibleProps } from "./collapsible.shared.js";
