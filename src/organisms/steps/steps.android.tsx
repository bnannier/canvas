import { createSteps } from "./steps.shared.js";
import { androidSkin } from "./steps.styles.js";

// Material 3 Steps. Metro resolves this file on Android; the docs import it for preview.
export const Steps = createSteps(androidSkin);
export type { Step, StepsProps } from "./steps.shared.js";
