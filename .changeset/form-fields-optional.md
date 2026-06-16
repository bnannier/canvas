---
"@olympusoss/canvas": patch
---

Form: make `fields` optional. A sectioned sidebar form supplies its inputs per
`sections` and never uses `fields`, but the prop was typed as required, so a
sections-only `<Form sidebar sections={…} />` failed type-checking. `fields` is
now optional and its uses are guarded, so sectioned forms type-check without a
dummy `fields` prop. No runtime change for forms that pass `fields`.
