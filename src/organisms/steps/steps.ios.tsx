import { createSteps } from "./steps.shared.js";
import { iosSkin } from "./steps.styles.js";

// iOS (HIG) Steps. Metro resolves this file on iOS; the docs import it for preview.
export const Steps = createSteps(iosSkin);
export type { Step, StepsProps } from "./steps.shared.js";
