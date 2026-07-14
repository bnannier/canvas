---
"@nannier/canvas": minor
---

The Icon set grows from ~90 hand-transcribed glyphs to 413 curated Lucide glyphs,
now generated rather than typed by hand. A new codegen pipeline (`tools/icongen`,
run via `bun run icons:gen`) reads `lucide-static`'s `icon-nodes.json` and emits
`src/atoms/icon/icon.glyphs.ts` (the `ICONS` primitive map, the `NAMES` gallery
list, the one-boolean-per-glyph `IconGlyphProps`, and the `IconName` union). To add
more glyphs, add their Lucide name to `tools/icongen/icons.ts` and regenerate.

The boolean-prop API is unchanged (`<Icon rocket />`, `<Icon creditCard muted />`),
`Icon` stays dependency-free at runtime (lucide-static is a dev dependency), and
every previously-shipped glyph name is preserved — Lucide's 1.x renames (e.g.
`more-horizontal`→`ellipsis`, `home`→`house`, `filter`→`funnel`) are aliased so
`<Icon home/>`, `<Icon filter/>`, `<Icon alertTriangle/>` etc. keep working. The
generator also gained fill support (Lucide `fill="currentColor"` nodes paint with
the glyph color), so filled glyphs like `palette` and `keyRound` render correctly.

New categories include arrows/chevrons, files, people & communication, media,
weather & nature, devices, commerce, transport, dev/data, and status symbols. The
`<Icon set />` gallery is the reference for the full list; the Icon prop table now
omits the 400+ glyph-name booleans (documented by the gallery) so its real props
stay legible.
