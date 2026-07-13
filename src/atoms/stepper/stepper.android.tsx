import { createStepper } from "./stepper.shared.js";
import { androidSkin } from "./stepper.styles.js";

// Material 3 Stepper. Metro resolves this on Android.
export const Stepper = createStepper(androidSkin);
export type { StepperProps } from "./stepper.shared.js";
