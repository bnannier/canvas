---
"@olympusoss/canvas": minor
---

Reorganize the component source into an atomic-design folder structure and ship
a co-located example doc with each component.

Every component now lives in its own folder under its atomic level, holding the
source and a co-located markdown example:
`src/<atoms|molecules|organisms>/<name>/<name>.tsx` plus `<name>.md`
(e.g. `src/atoms/avatar/avatar.tsx` + `avatar.md`). The 50 components split into
23 atoms, 15 molecules, and 12 organisms.

Each `<name>.md` is a mini-doc with the component name and description, a
`## Usage` block of real-component JSX, a `## Variants` block covering every
variant the component exposes (intents, sizes, states, composite layouts), and
`## Do & Don't` examples, every code block a real `@olympusoss/canvas` component.
These docs are the canonical example source: the documentation site renders each
page live from the `.md`, so the examples are exactly what ships.

The public API is unchanged: the package still exports only the `.` entry and
`./styles/*`, and the same named exports flow through new per-level barrels, so
consumers are unaffected.
