import { createAutocomplete } from "./autocomplete.shared.js";
import { iosSkin } from "./autocomplete.styles.js";

// iOS (HIG) Autocomplete. Metro resolves this file on iOS; the docs import it for preview.
export const Autocomplete = createAutocomplete(iosSkin);
export type { AutocompleteProps } from "./autocomplete.shared.js";
