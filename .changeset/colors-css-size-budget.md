---
"@nannier-com/canvas": patch
---

Trim the `--input` note in `styles/tokens/colors.css` back under its size budget.

2.55.1 explained the `input` / `border` split in a long comment inside the
shipped stylesheet, which pushed `styles/tokens/colors.css` from 1856B to 2368B
gzipped, past the 2048B per-file budget `check-size` enforces. `styles/` ships
to consumers, so those were real bytes on every install.

The note is now three lines and the full reasoning moved to `src/style/tokens.ts`
beside the values themselves, where it costs no shipped CSS. No token value
changes: `validate-tokens` and the render-parity check both still pass.
