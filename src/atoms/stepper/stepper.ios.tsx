import { createStepper } from "./stepper.shared.js";
import { iosSkin } from "./stepper.styles.js";

// iOS (HIG) Stepper. Metro resolves this file on iOS.
export const Stepper = createStepper(iosSkin);
export type { StepperProps } from "./stepper.shared.js";
