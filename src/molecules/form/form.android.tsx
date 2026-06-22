import { createForm } from "./form.shared.js";
import { androidSkin } from "./form.styles.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";
import { Checkbox as CheckboxAndroid } from "../../atoms/checkbox/checkbox.android.js";
import { Input as InputAndroid } from "../../atoms/input/input.android.js";

// Material 3 Form (composed from M3 text fields, selection controls, and buttons).
// Metro resolves this file on Android; the docs import it for preview. The composed
// Button/Checkbox/Input are passed as their Android-skinned atoms so the WEB docs
// 3-up shows M3 controls in the Android row (a barrel import would resolve the web
// atoms there); on a real device Metro resolves the right extension regardless.
export const Form = createForm(androidSkin, ButtonAndroid, CheckboxAndroid, InputAndroid);
export type { FormProps, FormField, FormCheckbox, FormSection } from "./form.shared.js";
