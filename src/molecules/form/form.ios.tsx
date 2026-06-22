import { createForm } from "./form.shared.js";
import { iosSkin } from "./form.styles.js";
import { Button as ButtonIOS } from "../../atoms/button/button.ios.js";
import { Checkbox as CheckboxIOS } from "../../atoms/checkbox/checkbox.ios.js";
import { Input as InputIOS } from "../../atoms/input/input.ios.js";

// iOS (HIG "Entering data" / SwiftUI grouped-inset Form) Form. Metro resolves this
// file on iOS; the docs import it for preview. The composed Button/Checkbox/Input
// are passed as their iOS-skinned atoms so the WEB docs 3-up shows iOS controls in
// the iOS row (a barrel import would resolve the web atoms there); on a real device
// Metro resolves the right extension regardless.
export const Form = createForm(iosSkin, ButtonIOS, CheckboxIOS, InputIOS);
export type { FormProps, FormField, FormCheckbox, FormSection } from "./form.shared.js";
