import { createListbox } from "./listbox.shared.js";
import { iosSkin } from "./listbox.styles.js";

// iOS (HIG) Listbox. iOS has no native listbox control (selecting one option from
// a list uses a pop-up button or picker menu there), so the Shared web look is
// correct: iosSkin is the same object as webSkin. Metro resolves this file on iOS;
// the docs do not register it (identical to the base).
export const Listbox = createListbox(iosSkin);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
