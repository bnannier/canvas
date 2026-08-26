---
name: canvas-example-style
description: Write or fix Canvas docs example code (.md fences) without styling escape hatches — the exact raw-style → semantic-component mapping tables (layout, typography, surfaces) and guardrail rules. Use when authoring/editing component .md examples or when docs:gen fails the style guardrail.
---

# Shim-free Canvas example code

Example fences (Usage / Variants / **Do**) must not pass banned `style={{…}}`
keys — the docgen guardrail hard-fails the build. `**Don't**` fences are exempt
(they demonstrate the anti-pattern on purpose). Allowed in `style`:
width/height/maxWidth/minWidth, textAlign, overflow. Everything else maps to a
semantic component below.

EXCEPTION: `maxWidth`/`minWidth` in a `style` placed DIRECTLY on `<Input>`,
`<Textarea>`, `<Select>`, `<Combobox>`, or `<Field>` is banned
(fieldWidthShimViolations): those controls carry the standard field width axis.
A bare field renders AT the standard 320px on every form factor (shrinking in
narrower parents via its own maxWidth:"100%"); pass `narrow` (240) or `wide`
(480) for the other modes, `block` to fill the container. Explicit `width` on
a control stays allowed for deliberate side-by-side comparisons, and width
bounds on wrapper Views/Cards remain composition (give a bounded composition
`width: N, maxWidth: "100%"`, not maxWidth alone, or it collapses to content
in the centered stage).

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
| marginLeft indent | spacer: `<Row flush><View style={{ width: N }} /><Column>…</Column></Row>` |

## Typography → role + tone + weight

`<Text style={{ fontSize… }}>` → `<Typography ROLE TONE WEIGHT>`. A bare
`<Text>` with NO style stays raw Text (allowed primitive).

| fontSize | role |
|---|---|
| 48 / 36 / 30 / 24 / 20 / 18 | `display` / `h1` / `h2` / `h3` / `h4` / `h5` |
| 15–16 | `lead` |
| 14 | `small` (`body` if lineHeight≈28) |
| 13 | `small` |
| 12 | `tiny` (`caption` if uppercase + letterSpacing) |
| 11 | `tiny` |

Tone by color: foreground/card-foreground → omit; muted-foreground → `muted`;
primary → `primary`; destructive → `destructive`; a green → `positive`; an amber
→ `warning`; 0.6-alpha foreground → `subtle`. Weight: 500 → `medium`, 600 →
`semibold`, 700 → `bold`. `fontFamily:"monospace"` → `mono` (or `code` for the
inline pill).

## Surfaces & widgets → real components

| hand-rolled | use instead |
|---|---|
| border+radius+bg+padding box | `<Card padded>` (+ `CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardSeparator`); `flat` drops shadow; `grow` fills a Row/Column; `selected` = chosen option surface |
| overlapping avatars (negative margin) | `<AvatarGroup max={n} total={m}>` |
| removable/selectable pill | `<Chip primary onRemove>` / `<Chip outline onPress icon={…} trailing={…}>` |
| icon or letter on a tinted square | `<IconTile TONE><Icon glyph /></IconTile>` / `<IconTile TONE label="U" />` |
| hairline rule (borderBottom/Top) | `<Divider />` / `<Divider vertical style={{height:16}} />` (label/action via children) |
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
- If NO component expresses the need, do NOT force a broken rewrite: either add
  the capability to the kit first (see the `canvas-new-component` skill) or, for
  a genuine demo-only surface, use a justified
  `// docgen-allow-style: <reason>` line comment (last resort).
- Validate: `bun run docs:gen` (hard-fails on violations) +
  `bunx tsc --noEmit -p docs/src/core/tsconfig.json`.
