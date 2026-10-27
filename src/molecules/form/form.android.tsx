import { createForm, createFormSection } from "./form.shared.js";
import { androidSkin } from "./form.styles.js";
import { Button as ButtonAndroid } from "../../atoms/button/button.android.js";

// Android Form: the web form (androidSkin aliases the web skin; Material 3 has no form
// component). Metro resolves this file on Android; the docs import it for preview. The
// actions row composes the Android Button so the WEB docs 3-up shows the M3 control in the
// Android row (a barrel import would resolve the web atom there).
export const Form = createForm(androidSkin, ButtonAndroid);
export const FormSection = createFormSection(androidSkin);
export type { FormProps, FormSectionProps } from "./form.shared.js";
