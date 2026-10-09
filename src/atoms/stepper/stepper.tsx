import { createStepper } from "./stepper.shared.js";
import { webSkin } from "./stepper.styles.js";

/** A numeric field between minus and plus buttons, clamped to a range. */
export const Stepper = createStepper(webSkin);
export type { StepperProps } from "./stepper.shared.js";
