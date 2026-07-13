import { createSteps } from "./steps.shared.js";
import { webSkin } from "./steps.styles.js";

// Web Steps (the base; Metro falls back to it on native, web bundlers resolve it).
export const Steps = createSteps(webSkin);
export type { Step, StepsProps } from "./steps.shared.js";
