import { createCollapsible } from "./collapsible.shared.js";
import { androidSkin } from "./collapsible.styles.js";

// Material 3 Collapsible. Metro resolves this on Android.
export const Collapsible = createCollapsible(androidSkin);
export type { CollapsibleProps } from "./collapsible.shared.js";
