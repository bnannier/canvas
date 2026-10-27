import { createListbox } from "./listbox.shared.js";
import { androidSkin } from "./listbox.styles.js";

// Material 3 Listbox. Material 3 has no listbox control (the exposed dropdown menu
// is the select idiom), so the rows take the hand-off's look: androidSkin is the
// same object as webSkin, and every chosen row carries the trailing check. The
// android_ripple on each row supplies the native press feedback. Metro resolves this
// file on Android; the docs import it for preview.
export const Listbox = createListbox(androidSkin);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
