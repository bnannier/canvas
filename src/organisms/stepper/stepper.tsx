import { createStepper } from "./stepper.shared.js";
import { webSkin } from "./stepper.styles.js";

// Web Stepper (the base; Metro falls back to it on native, web bundlers resolve it).
export const Stepper = createStepper(webSkin);
export type { Step, StepperProps } from "./stepper.shared.js";
