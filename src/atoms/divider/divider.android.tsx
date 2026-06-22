import { createDivider } from "./divider.shared.js";
import { androidSkin } from "./divider.styles.js";

// Material 3 Divider (the 1dp divider). Metro resolves this file on Android; the docs import it
// for preview. Divider is a "Shared" treatment, so the Android skin matches the web look exactly.
export const Divider = createDivider(androidSkin);
export type { DividerProps } from "./divider.shared.js";
