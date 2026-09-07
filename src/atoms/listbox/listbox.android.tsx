import { createListbox } from "./listbox.shared.js";
import { androidSkin } from "./listbox.styles.js";
import { CheckboxIndicator } from "../checkbox/indicator/index.android.js";

// Material 3 Listbox. Material 3 has no listbox control (the exposed dropdown menu
// is the select idiom there), so the Shared web look is correct: androidSkin is
// the same object as webSkin. The android_ripple on each row supplies the native
// press feedback. Metro resolves this file on Android; explicit skin previews
// also keep the Android Checkbox artwork in multi-select mode.
export const Listbox = createListbox(androidSkin, CheckboxIndicator);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
