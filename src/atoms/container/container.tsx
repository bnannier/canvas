import { createContainer } from "./container.shared.js";
import { webSkin } from "./container.styles.js";

// Web Container (the base; Metro falls back to it on native, web bundlers
// resolve it). Layout is a Shared treatment, so all three platform skins carry
// the same padding scale.
/**
 * The bounds provider: full width by default, or capped and centered at a step of the
 * width scale (`xxxs` 192 through `page` 1280).
 */
export const Container = createContainer(webSkin);
export { containerStyle, measureOf, FLUID } from "./container.shared.js";
export type { ContainerProps, Measure } from "./container.shared.js";
