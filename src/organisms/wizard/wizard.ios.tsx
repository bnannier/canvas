import { createWizard } from "./wizard.shared.js";
import { iosSkin } from "./wizard.styles.js";
import { Dialog } from "../dialog/dialog.ios.js";
import { Steps } from "../steps/steps.ios.js";
import { Button } from "../../atoms/button/button.ios.js";

/** A controlled modal workflow using the iOS Dialog and navigation controls. */
export const Wizard = createWizard(iosSkin, { Dialog, Steps, Button });
export type { WizardProps } from "./wizard.shared.js";
