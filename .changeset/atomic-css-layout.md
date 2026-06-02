---
"@olympusoss/canvas": minor
---

Reorganize component CSS by atomic-design level. The files that lived under
`styles/components/` now live under `styles/atoms/`, `styles/molecules/`, and
`styles/organisms/`, matching how the docs and the `category` field classify
components.

Migration: only affects consumers that import individual component CSS files.
Update the path to the component's atomic level, e.g.
`@olympusoss/canvas/styles/components/button.css` becomes
`@olympusoss/canvas/styles/atoms/button.css` (button is an Atom; card is a
Molecule; data-table is an Organism). The all-in-one
`@olympusoss/canvas/styles/canvas.css` entry is unchanged, so consumers using it
need no changes. Tokens, patterns, and utilities directories are unchanged.
