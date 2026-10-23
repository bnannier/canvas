import { createAppFrame, createPage } from "./app-frame.shared.js";
import { webSkin } from "./app-frame.styles.js";

// Web AppFrame and Page (the base; Metro falls back to them on native, web bundlers
// resolve them). App scaffolding is a Shared treatment, so all three platform skins
// carry the same frame fill and gutter.
/**
 * The app's root frame: the safe-area context and the app-root overlay host, all four
 * safe-area edges padded over the theme background, an optional banner header and a body
 * that fills the height left.
 */
export const AppFrame = createAppFrame(webSkin);
/**
 * One scrolling screen: a `role="main"` scroller that fills its parent, with page gutters
 * and its content capped and centered at a step of the width scale (`widest` by default).
 */
export const Page = createPage(webSkin);
export type { AppFrameProps, PageProps } from "./app-frame.shared.js";
