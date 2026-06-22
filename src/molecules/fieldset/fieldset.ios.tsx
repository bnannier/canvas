import { createFieldset } from "./fieldset.shared.js";
import { iosSkin } from "./fieldset.styles.js";
import { Input as InputIOS } from "../../atoms/input/input.ios.js";
import { Checkbox as CheckboxIOS } from "../../atoms/checkbox/checkbox.ios.js";

// iOS (HIG Boxes / SwiftUI GroupBox) Fieldset. Metro resolves this file on iOS; the
// docs import it for preview. It composes the iOS-styled Input/Checkbox atoms so the
// embedded controls read native; the literal `.ios` imports are required for the WEB
// docs 3-up, where a barrel import would resolve the web atoms.
export const Fieldset = createFieldset(iosSkin, InputIOS, CheckboxIOS);
export type { FieldsetProps, FieldsetItem } from "./fieldset.shared.js";
