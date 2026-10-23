import { createAppFrame, createPage } from "./app-frame.shared.js";
import { androidSkin } from "./app-frame.styles.js";

// Android AppFrame and Page. Metro resolves this file on Android. App scaffolding is a
// Shared treatment: androidSkin references the same frame fill and gutter as the web skin.
export const AppFrame = createAppFrame(androidSkin);
export const Page = createPage(androidSkin);
export type { AppFrameProps, PageProps } from "./app-frame.shared.js";
