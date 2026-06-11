import { createStepper } from "./stepper.shared.js";
import { androidSkin } from "./stepper.styles.js";

// Material 3 Stepper. Metro resolves this file on Android; the docs import it for preview.
export const Stepper = createStepper(androidSkin);
export type { Step, StepperProps } from "./stepper.shared.js";
