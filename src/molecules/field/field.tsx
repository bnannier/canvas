import { createField } from "./field.shared.js";
import { webSkin } from "./field.styles.js";

// Web Field (the base; Metro falls back to it on native, web bundlers resolve
// it). Composes the web base atoms by default (createField's defaults), so a
// value row's avatar stack, status/plan badge, Copy button, and the control-mode
// Input all read web-styled here.
export const Field = createField(webSkin);
export type { FieldProps, FieldRow, FieldAvatar } from "./field.shared.js";
