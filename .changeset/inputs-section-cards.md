---
"@nannier/canvas": minor
---

The Inputs section cards' kit pieces (justification for the minor: new public options, Autocomplete option details, `FormSection aside` and Form `hints`).

- Autocomplete `options` take `{ label, detail }` objects beside strings: the detail sits at the row's end in the 11 px mono face in the subtle ink, and the row is announced as "label, detail". The web field ends in a 15 px chevrons-up-down 10 px from its end, and the toggle inside a pinned-focus field no longer draws a ring of its own.
- `FormSection aside`: the heading in a rail beside the rows (the `xs` step, 48 px gutter, a 20 px display title over a 14 px description, rows 18 apart, 28 above and below, a closing rule), stacking at 512 px or narrower. Form `hints`: leading content in the actions row, which then spreads hints and buttons to its ends; after a closing aside section the actions row drops its rule.
- Input: the web password eye shows the open eye while masked and the struck eye once revealed; a field held focused by InteractionOverride draws the web's 1.5 px accent caret after its value, blinking on the loop primitive.
- Listbox rows at the hand-off's 18.2 / 16.2 leading; Switch title and description at 18.2 / 17.4; the PhoneInput country row's 16 px flag at a 10 px gap with the dial code in 12 px mono; the FilterPanel's Clear a plain accent text action and its web option label 400 14 px, 10 from the box.
