import { createTooltip } from "./tooltip.shared.js";
import { webSkin } from "./tooltip.styles.js";

// Web Tooltip (the base; Metro falls back to it on native, web bundlers resolve it).
export const Tooltip = createTooltip(webSkin);
export type { TooltipProps } from "./tooltip.shared.js";
