import { createWizard } from "./wizard.shared.js";
import { Dialog } from "../dialog/dialog.android.js";
import { Steps } from "../steps/steps.android.js";
import { Button } from "../../atoms/button/button.android.js";

/** A controlled modal workflow using the Android Dialog and navigation controls. */
export const Wizard = createWizard({ Dialog, Steps, Button });
export type { WizardProps } from "./wizard.shared.js";
