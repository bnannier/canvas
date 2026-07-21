import { createForm, createFormSection } from "./form.shared.js";
import { webSkin } from "./form.styles.js";

// Web Form (the base; Metro falls back to it on native, web bundlers resolve it).
// The actions row composes the default web-base Button.
export const Form = createForm(webSkin);
export const FormSection = createFormSection(webSkin);
export type { FormProps, FormSectionProps } from "./form.shared.js";
