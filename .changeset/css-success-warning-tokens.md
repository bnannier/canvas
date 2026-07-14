---
"@olympusoss/canvas": patch
---

Add the `success` and `warning` semantic color tokens (and their foregrounds) to the
shipped `styles/canvas.css`, so web consumers get `bg-success` / `text-warning` /
etc. utilities that match the JS `success` / `warning` tokens. These existed in the
JS token set but were missing from the CSS layer; a new parity check in
`validate-tokens` now cross-references the CSS variables against
`src/style/tokens.ts` so the two sources cannot silently drift again.
