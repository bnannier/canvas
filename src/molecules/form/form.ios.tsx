import { createForm, createFormSection } from "./form.shared.js";
import { iosSkin } from "./form.styles.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";

// iOS (HIG "Entering data" / SwiftUI grouped-inset Form) Form. Metro resolves
// this file on iOS; the docs import it for preview. The actions row composes the
// iOS-skinned Button so the WEB docs 3-up shows the iOS control in the iOS row (a
// barrel import would resolve the web atom there); on a real device Metro
// resolves the right extension regardless.
export const Form = createForm(iosSkin, ButtonIOS);
export const FormSection = createFormSection(iosSkin);
export type { FormProps, FormSectionProps } from "./form.shared.js";
