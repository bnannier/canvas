import { createFieldset } from "./fieldset.shared.js";
import { androidSkin } from "./fieldset.styles.js";
import { Input as InputAndroid } from "../../atoms/input/input.android.js";
import { Checkbox as CheckboxAndroid } from "../../atoms/checkbox/checkbox.android.js";

// Material 3 Fieldset (M3 has no fieldset; the shared structure carries M3
// conventions). Metro resolves this file on Android; the docs import it for preview.
// It composes the Android-styled Input/Checkbox atoms so the embedded controls read
// native; the literal `.android` imports are required for the WEB docs 3-up, where a
// barrel import would resolve the web atoms.
export const Fieldset = createFieldset(androidSkin, InputAndroid, CheckboxAndroid);
export type { FieldsetProps, FieldsetItem } from "./fieldset.shared.js";
