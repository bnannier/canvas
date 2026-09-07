import { createListbox } from "./listbox.shared.js";
import { iosSkin } from "./listbox.styles.js";
import { CheckboxIndicator } from "../checkbox/indicator/index.ios.js";

// iOS (HIG) Listbox. iOS has no native listbox control (selecting one option from
// a list uses a pop-up button or picker menu there), so the Shared web look is
// correct: iosSkin is the same object as webSkin. Metro resolves this file on iOS;
// multi-select also keeps the iOS Checkbox artwork in explicit skin previews.
export const Listbox = createListbox(iosSkin, CheckboxIndicator);
export type { ListboxProps, ListboxItem } from "./listbox.shared.js";
