import { createAutocomplete } from "./autocomplete.shared.js";
import { webSkin } from "./autocomplete.styles.js";

// Web Autocomplete (the base; Metro falls back to it on native, web bundlers resolve it).
/** A text field with a filtered list of options under it: searchable single-select. */
export const Autocomplete = createAutocomplete(webSkin);
export type { AutocompleteProps } from "./autocomplete.shared.js";
