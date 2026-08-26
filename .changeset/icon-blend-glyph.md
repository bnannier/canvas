---
"@nannier/canvas": minor
---

Icon: the `blend` glyph joins the curated set (414 glyphs).

Minor justification (new public API): `<Icon blend />` is a boolean that did not
exist before, and `"blend"` becomes a new member of the exported `IconName` union,
so every data-driven `icon` slot that types against it (Dropdown, Command, Sidebar,
RowMenu, Feed, ButtonGroup, Stats) can now name it. Code written against 2.51.x
does not compile against the glyph today; after this release it does.

Lucide's `blend` is two overlapping circles, the standard glyph for mixing two
surfaces. It is the honest icon for a glass/solid surface toggle, which previously
had to borrow `sparkles` (a magic-wand metaphor that names an effect, not a
material). Nothing existing changes: the set only grows, every prior glyph name is
untouched, and the `<Icon set />` gallery picks the new entry up automatically
because it renders from the generated `NAMES` table.

The set is generated, so the change is one name added to `tools/icongen/icons.ts`
plus a `bun run icons:gen`; `src/atoms/icon/icon.glyphs.ts` is the regenerated
output. The new `test/icon-glyphs.test.ts` pins that output against both of its
inputs (the curated source list and lucide-static's `icon-nodes.json`), so a name
added without a regenerate now fails a test instead of surfacing as a missing
glyph at a call site.
