import { createForm } from "./form.shared.js";
import { webSkin } from "./form.styles.js";

// Web Form (the base; Metro falls back to it on native, web bundlers resolve it).
// The default web-base atoms (Button/Checkbox/Input) are correct here.
export const Form = createForm(webSkin);
export type { FormProps, FormField, FormCheckbox, FormSection } from "./form.shared.js";
