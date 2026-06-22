import { createListbox } from "./listbox.shared.js";
import { androidSkin } from "./listbox.styles.js";

// Material 3 Listbox. Material 3 has no listbox control (the exposed dropdown menu
// is the select idiom there), so the Shared web look is correct: androidSkin is
// the same object as webSkin. The android_ripple on each row supplies the native
// press feedback. Metro resolves this file on Android; the docs do not register it
// (identical to the base).
export const Listbox = createListbox(androidSkin);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
