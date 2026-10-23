import { createAppFrame, createPage } from "./app-frame.shared.js";
import { iosSkin } from "./app-frame.styles.js";

// iOS AppFrame and Page. Metro resolves this file on iOS. App scaffolding is a Shared
// treatment: iosSkin references the same frame fill and gutter as the web skin.
export const AppFrame = createAppFrame(iosSkin);
export const Page = createPage(iosSkin);
export type { AppFrameProps, PageProps } from "./app-frame.shared.js";
