import { createForm, createFormSection } from "./form.shared.js";
import { androidSkin } from "./form.styles.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";

// Material 3 Form (composed from M3 text fields, selection controls, and
// buttons). Metro resolves this file on Android; the docs import it for preview.
// The actions row composes the Android-skinned Button so the WEB docs 3-up shows
// the M3 control in the Android row (a barrel import would resolve the web atom
// there); on a real device Metro resolves the right extension regardless.
export const Form = createForm(androidSkin, ButtonAndroid);
export const FormSection = createFormSection(androidSkin);
export type { FormProps, FormSectionProps } from "./form.shared.js";
