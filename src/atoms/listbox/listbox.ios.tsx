import { createListbox } from "./listbox.shared.js";
import { iosSkin } from "./listbox.styles.js";

// iOS (HIG) Listbox. iOS has no listbox control, so the rows take the hand-off's look
// (iosSkin is the same object as webSkin), every chosen row carrying the trailing check,
// as an iOS list marks a choice. Metro resolves this file on iOS; the docs import it for preview.
export const Listbox = createListbox(iosSkin);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
