import { createStepper } from "./stepper.shared.js";
import { iosSkin } from "./stepper.styles.js";

// iOS (HIG) Stepper. Metro resolves this file on iOS; the docs import it for preview.
export const Stepper = createStepper(iosSkin);
export type { Step, StepperProps } from "./stepper.shared.js";
