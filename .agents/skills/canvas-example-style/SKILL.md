---
name: canvas-example-style
description: Write or fix Canvas docs example code (.md fences) without styling escape hatches — the exact raw-style → semantic-component mapping tables (layout, typography, surfaces) and guardrail rules. Use when authoring/editing component .md examples or when docs:gen fails the style guardrail.
---

# Shim-free Canvas example code

Example fences (Usage / Variants / **Do**) must not pass banned `style={{…}}`
keys — the docgen guardrail hard-fails the build. `**Don't**` fences may show
the anti-pattern deliberately; a comparison still has to fit its stage.
Handwritten docs TSX follows the same rule and is checked by
`bun run check:docs-components`. Importing a Canvas primitive does not make a
hand-styled substitute control acceptable.

The parent supplies bounds. Fields use FILL and content-sized controls use HUG;
they do not render at a fixed field width. A measure is a `Container` step
(`xxxs` through `page`), a Row child's `span`, or a Grid cell. Use
`<Container sm start><Input /></Container>`, or `<Input sm start>` where the
component supports `MeasureProps`. A measure caps a fluid component; it does
not set a fixed width. Do not add `width`, `maxWidth`, or `minWidth` to a
component or wrapper View, and do not use the removed `narrow` field prop or
the old 480px meaning of `wide` (`wide` is now the 896px scale step).

Spacing, alignment, typography and surfaces come from semantic props and the
kit's layout components. There is no general allowance for raw dimensions or
other `style` overrides in an example. Token specimens, primitive pedagogy and
genuine docs infrastructure need a narrow, centrally reviewed exemption; a
source comment is not authorization.

## Layout → Row / Column

`<View style={{ flexDirection:"row", ... }}>` → `<Row …>`; column/no direction →
`<Column …>`.

| raw | boolean prop |
|---|---|
| gap 0 (or none) | `flush` |
| gap 2–4 | `tight` |
| gap 6–10 | `snug` |
| gap 12 | `cozy` |
| gap 14–20 | `relaxed` |
| gap ≥24 | `loose` |
| alignItems center/flex-start/flex-end/baseline | `alignCenter`/`alignStart`/`alignEnd`/`baseline` |
| justifyContent center/flex-end/space-between/space-around/space-evenly | `center`/`end`/`between`/`around`/`evenly` |
| flexWrap:"wrap" | `wrap` |
| flex:1 | wrap the child in `<Column fill>` (or `fill` if the Row/Column IS the flexing box) |
| flexGrow:1 | `grow` |
| symmetric padding 8/16/24 | `padTight`/`pad`/`padLoose` (snap others to nearest) |
| a lone marginTop/Bottom between siblings | delete it; the parent's gap owns spacing |
| marginLeft indent | use the component's semantic indentation capability; omit an example if no existing component represents it |

## Typography → role + tone + weight

`<Text style={{ fontSize… }}>` → `<Typography ROLE TONE WEIGHT>`. A bare
`<Text>` with NO style stays raw Text (allowed primitive).

| fontSize | role |
|---|---|
| 24 / 20 / 17 / 16 / 15 / 14 | `display` / `h1` / `h2` / `h3` / `h4` / `h5` |
| 14, supporting reading text | `lead` |
| 12.5, default reading text | `body` |
| 11.5, secondary reading text | `small` |
| 11, metadata | `tiny` |
| uppercase eyebrow | `caption` |

Tone by color: foreground/card-foreground → omit; muted-foreground → `muted`;
primary → `primary`; destructive → `destructive`; a green → `success`; an amber
→ `warning`; 0.6-alpha foreground → `subtle`. Weight: 500 → `medium`, 600 →
`semibold`, 700 → `bold`. `fontFamily:"monospace"` → `mono` (or `code` for the
inline pill).

## Surfaces & widgets → real components

| hand-rolled | use instead |
|---|---|
| border+radius+bg+padding box | `<Card padded>` (+ `CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardSeparator`); `flat` drops shadow; `grow` fills a Row/Column; `selected` = chosen option surface |
| overlapping avatars (negative margin) | `<AvatarGroup max={n} total={m}>` |
| removable/selectable pill | `<Chip primary onRemove>` / `<Chip outline onPress icon={…} trailing={…}>` |
| icon or letter on a tinted square | `<Emblem TONE><Icon glyph /></Emblem>` / `<Emblem TONE label="U" />` |
| hairline rule (borderBottom/Top) | `<Divider />` / `<Divider vertical />` (label/action via children) |
| inline trend bars | `<Sparkline values={[…]} />` |
| proportional segment bar + legend | `<StackedBar segments={[{label,value}…]} />` |
| ring with centered % | `<Gauge value={72} label="Uptime" />` |
| intensity grid | `<Heatmap values={[0..1…]} />` |
| labeled input + helper | `<Field label helper placeholder />` |
| search-launcher / icon button | `<Button outline block iconLeft={…} iconRight={<Kbd>⌘K</Kbd>}>` / `<Button ghost iconLeft={…} accessibilityLabel=… />` |
| borderless textarea in a framed toolbar | `<Textarea flush />` inside `<Card flat>` + `<Row padTight>` toolbar + `<Divider />` |
| long breadcrumb with "…" | `<Breadcrumb maxItems={3} items={…} />` |

## Rules of engagement

- Never invent a tag: every JSX tag must exist in `docs/src/core/live-scope.ts`.
- Never touch `**Don't**` fences — byte-for-byte pedagogy.
- A docs example, pattern or catalog tile is shown only when an existing kit
  component fits it. If none fits, omit the example. Never add a kit component
  or capability solely to satisfy an example. A separately requested functional
  product gap can still justify extending the kit.
- Keep a control's label and secondary line in its own `children` and
  `description` slots; do not rebuild its label anatomy beside it.
- Validate: `bun run docs:gen` (hard-fails on violations) +
  `bun run check:docs-components` + `bunx tsc --noEmit -p docs/src/core/tsconfig.json`.
