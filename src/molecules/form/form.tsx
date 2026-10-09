import { createForm, createFormSection } from "./form.shared.js";
import { webSkin } from "./form.styles.js";

// Web Form (the base; Metro falls back to it on native, web bundlers resolve it).
// The actions row composes the default web-base Button.
/**
 * Lays out field rows in a stacked or two-column rhythm, with titled sections and a submit
 * and cancel row.
 */
export const Form = createForm(webSkin);
/** A titled group of rows inside a Form. */
export const FormSection = createFormSection(webSkin);
export type { FormProps, FormSectionProps } from "./form.shared.js";
