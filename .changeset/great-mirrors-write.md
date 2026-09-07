---
"@nannier-com/canvas": minor
---

The package now ships `DESIGN.md`: the kit's design system, written to be read.

Minor justification: this is a new file in the published package, so a consumer, or
more often an agent working in a consumer's repository, can read the kit's actual
values and rules without a network round trip to the docs site.

Its frontmatter follows the schema the design-md library uses for the production
systems it documents, so a tool that can read one of those can read this: the colour
tokens for both schemes, the ten type roles with size, weight and line height, the
spacing, radius, elevation, motion, breakpoint and field-width scales, both platforms'
touch minimums, and per-platform component recipes.

All of that is GENERATED, from `src/style/tokens.ts` and `styles/tokens/*.css`, with a
`--check` gate in CI, so it cannot describe a previous release. The prose is authored,
because none of it is derivable from a number: that every visual variation is a
semantic boolean prop and string enums do not exist, that there is no style escape
hatch, that glass is a theming mode rather than a per-component look, that a control
owns the text it labels, and that responsiveness goes intrinsic first, container
second, viewport only for the shell.
