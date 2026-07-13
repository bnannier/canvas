import { createStepper } from "./stepper.shared.js";
import { webSkin } from "./stepper.styles.js";

export const Stepper = createStepper(webSkin);
export type { StepperProps } from "./stepper.shared.js";
