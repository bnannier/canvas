import { createDivider } from "./divider.shared.js";
import { webSkin } from "./divider.styles.js";

// Web Divider (the base; Metro falls back to it on native, web bundlers resolve it).
export const Divider = createDivider(webSkin);
export type { DividerProps } from "./divider.shared.js";
