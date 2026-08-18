---
"@nannier/canvas": patch
---

Colors hand-off: condense the Liquid Glass commentary in `styles/tokens/colors.css`
so the file fits its 2KB per-file gzip budget again. The file had crossed to 2089B
against the 2048B cap, failing `check-size` on main. No token changed: all 78
declarations are byte-identical, and only comment prose was removed.

The block that shrank was the ~1KB Liquid Glass explanation, which restated at
length what `src/style/glass-surface` implements and what the glass section of
`CLAUDE.md` already documents. What a reader of the stylesheet actually needs
stays: that glass is the functional layer's material and content surfaces remain
solid, that it is a lens rather than a frost with the bend concentrated at the
rim, and what `--glass-lens` and `--glass-frost` each are. The file now measures
1834B gzip, so it carries 214B of headroom rather than the 34B it had before,
which is what let a single comment edit push it over.

A per-file exception was considered and rejected: `check-size.ts` justifies the
`platforms.css` override precisely on the grounds that the 2KB guard must keep
biting on `colors.css`, so excepting this file would undercut the reason the
mechanism exists. Since the stylesheet ships to consumers, prose duplicated
elsewhere is a cost every consumer pays to download.
