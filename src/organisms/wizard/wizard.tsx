import { createWizard } from "./wizard.shared.js";
import { webSkin } from "./wizard.styles.js";

/** A controlled modal workflow with fixed steps and navigation around a scrolling body. */
export const Wizard = createWizard(webSkin);
export type { WizardProps } from "./wizard.shared.js";
