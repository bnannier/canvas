import { createCollapsible } from "./collapsible.shared.js";
import { iosSkin } from "./collapsible.styles.js";

// iOS (HIG) Collapsible. Metro resolves this on iOS.
export const Collapsible = createCollapsible(iosSkin);
export type { CollapsibleProps } from "./collapsible.shared.js";
