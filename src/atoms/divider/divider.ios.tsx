import { createDivider } from "./divider.shared.js";
import { iosSkin } from "./divider.styles.js";

// iOS Divider (SwiftUI Divider hairline). Metro resolves this file on iOS; the docs import it
// for preview. Divider is a "Shared" treatment, so the iOS skin matches the web look exactly.
export const Divider = createDivider(iosSkin);
export type { DividerProps } from "./divider.shared.js";
