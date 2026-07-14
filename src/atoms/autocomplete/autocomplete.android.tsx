import { createAutocomplete } from "./autocomplete.shared.js";
import { androidSkin } from "./autocomplete.styles.js";

// Material 3 Autocomplete. Metro resolves this file on Android; the docs import it for preview.
export const Autocomplete = createAutocomplete(androidSkin);
export type { AutocompleteProps } from "./autocomplete.shared.js";
