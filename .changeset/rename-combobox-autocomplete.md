---
"@nannier/canvas": major
---

Rename the `Combobox` component to `Autocomplete`. The searchable single-select (a
text input paired with a filtering dropdown) is unchanged in behavior, props, and
accessibility, but its export, type, and docs route are renamed: `Combobox` →
`Autocomplete`, `ComboboxProps` → `AutocompleteProps`, and `/components/combobox` →
`/components/autocomplete` (the old route redirects). The underlying ARIA
`role="combobox"` on the field is intentionally kept, since that is the WAI-ARIA role
for this pattern. To migrate, replace `import { Combobox } from "@nannier/canvas"`
with `import { Autocomplete } from "@nannier/canvas"` and rename the JSX tag and any
`ComboboxProps` references.
