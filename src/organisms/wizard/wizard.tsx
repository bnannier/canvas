import { createWizard } from "./wizard.shared.js";

/** A controlled modal workflow with fixed steps and navigation around a scrolling body. */
export const Wizard = createWizard();
export type { WizardProps } from "./wizard.shared.js";
