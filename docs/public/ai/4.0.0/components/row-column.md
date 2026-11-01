# Row & Column

Package: @nannier/canvas
Version: 4.0.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d245658f4bbe4b0d228e837d45b679ef7d0b430b11e0391463a008af7a4548de

Source: `src/atoms/layout/layout.md`
Human reference: https://canvas.nannier.com/components/row-column

## Public imports

```tsx
import { Column, Row } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The layout primitives. `Row` lays children out horizontally, `Column`
vertically. Both own arrangement through semantic boolean axes, a gap scale
(`flush` / `tight` / `snug` / `cozy` / `relaxed` / `loose`), main-axis
distribution (`center`, `between`, …), cross-axis alignment (`alignCenter`,
`baseline`, …), and `wrap` / `fill` / `grow` / `shrink`, so a call site never
hand-rolls `flexDirection`, `gap`, or `alignItems`.

The Argus reference adds intermediate spacing steps without rounding its layout:
`fine` 3, `dense` 5, `compact` 6, `close` 7, `nested` 9, `comfortable` 10,
`balanced` 11, `roomy` 14, `airy` 18, `spacious` 20, `generous` 22,
`section` 26, `panel` 28, `page` 30, `apart` 32 (the space between the side-by-side
panels of one composition), `ample` 40 (between a section page's hero and the body under
it, and between the hero's halves) and `broad` 48 (between the two halves of a page-wide split). Existing named steps keep their values.
Larger active steps take precedence.

`ample` (40) is the step between a section page's hero and the body under it, and between
the hero's halves (the Canvas v4 section pages). `chapter` (64) is the widest step: the
space between a page's chapters, the major sections of a long page (a component detail
page's Playground, Props and Examples). It wins over every other gap step, so the
precedence runs `chapter` > `broad` > `ample` > `apart` > `page` > `panel` > `section` >
`loose` and on down the scale to `flush`. Row, Column and Grid all take them.

`rowsTight`, `rowsComfortable`, `rowsSnug`, `rowsCozy`, `rowsSection` and `rowsPanel` set a
wrapped or stacked row's vertical gap to 4, 10, 8, 12, 26 and 28 independently of its main
gap (a stacked `Row stacks` lays its children down that vertical gap, so a hero whose
halves sit 40 apart beside each other and 28 apart stacked is `ample rowsPanel`). Application inset
roles preserve identity headers (24 top/horizontal, 18 bottom), action footers
(16 vertical, 24 horizontal), theme controls (14 top, 26 horizontal), status bands
(10 vertical, 28 horizontal), and navigation close controls (12 top/horizontal):
`insetIdentity`, `insetActions`, `insetTheme`, `insetStatus`, and `insetTabs`.

## Usage

```tsx
<Row>
  <Button primary>Save</Button>
  <Button ghost>Cancel</Button>
</Row>
```

## Variants

### Vertical stack

```tsx
<Column>
  <Button primary>Save</Button>
  <Button ghost>Cancel</Button>
</Column>
```

### Chapters

The widest gap, between the major sections of a long page.

```tsx
<Column chapter>
  <Typography h3 level={2}>Playground</Typography>
  <Typography h3 level={2}>Props</Typography>
  <Typography h3 level={2}>Examples</Typography>
</Column>
```

### Centered row

```tsx
<Row center>
  <Badge>schema</Badge>
  <Badge>role</Badge>
</Row>
```

### Space between

```tsx
<Row between>
  <Typography small>Request ID</Typography>
  <Typography mono>req_8f2c10ab</Typography>
</Row>
```

### Wrap

```tsx
<Row wrap>
  <Badge>alpha</Badge>
  <Badge>beta</Badge>
  <Badge>gamma</Badge>
  <Badge>delta</Badge>
  <Badge>epsilon</Badge>
  <Badge>zeta</Badge>
</Row>
```

### Shrink a child to the row

React Native gives every box `flexShrink: 0`, the opposite of the web's flex
default, so a Row child sized by a long sentence keeps that sentence's full
single-line width and spills past the row's edge, where the nearest clipping
ancestor cuts it mid-word. `shrink` hands the row's width back to the text: the
child gives way and the copy wraps. Reach for it on the copy in a
heading-beside-actions row, or any Row child whose width should follow the row
rather than its own longest line. It is not `fill`: `fill` also zeroes the flex
basis, so in a `wrap` row every child then fits on one line and the actions stop
wrapping below the copy.

```tsx
<Row between alignEnd wrap>
  <Column tight shrink>
    <Typography h3>Dashboard</Typography>
    <Typography small muted>Identity platform overview. Each widget reports its own window.</Typography>
  </Column>
  <Button outline small>Export</Button>
</Row>
```

### Padded surround

```tsx
<Card flush>
  <Row pad>
    <Typography>Padded surround</Typography>
  </Row>
</Card>
```

### Stacks at narrow widths

`stacks` renders the Row as a Column when the row's own container is at or
below `stackBreakpoint` (default `sm` = 640): container-measured, so it stacks
inside a narrow desktop column too, and the same gap, distribution, alignment,
and padding props apply to the new axes. Children keep their own sizing, which
makes `stacks` the tool for content-sized rows (a toolbar, a label beside its
actions); equal-width tiles that should renumber columns belong to `Grid`. A
Column never needs the inverse: a Column that must become a Row is a Row that
stacks.

```tsx
<Row stacks>
  <Input placeholder="Search runs" />
  <Button primary>New run</Button>
</Row>
```

### Spans (twelfths of the Row)

A direct child's `span` is its width in twelfths of the Row, Bootstrap's
`col-n`: `span={6}` is half, `span={4}` a third, `span={8}` two thirds. The Row
measures its own width and hands each spanning child a px cell with the gaps
accounted for, so two `span={6}` children and the gap between them fill the row
exactly, and spans past twelve wrap onto the next line. Fill components inside a
span (a field, a card) fill the cell.

```tsx
<Row>
  <Column span={8}>
    <Card>
      <Typography medium>Eight of twelve</Typography>
    </Card>
  </Column>
  <Column span={4}>
    <Card>
      <Typography medium>Four</Typography>
    </Card>
  </Column>
</Row>
```

### Spans that stack

`stacks` and spans compose: below the breakpoint the Row becomes a Column and
every child is full width, the `col-12 col-md-6` idiom without a second prop.
Crossing the breakpoint changes the layout only: every child stays mounted, so
a field keeps its text and focus when a window is resized across it or a phone
switches from the server's desktop layout after hydration. This is why a
two-pane screen is a `Row stacks` of spans rather than a Row on one side of a
`useFormFactor()` branch and a Column on the other, which remounts everything
inside.

```tsx
<Row stacks>
  <Column span={6}>
    <Card>
      <Typography medium>Left</Typography>
    </Card>
  </Column>
  <Column span={6}>
    <Card>
      <Typography medium>Right</Typography>
    </Card>
  </Column>
</Row>
```

### Weights (a share of the free width)

A direct child's `weight` is its share of the Row's width after the gaps, CSS
grid's `fr`: `weight={1.7}` beside `weight={1}` splits the row 1.7 to 1 whatever
either side holds, for the ratios twelfths cannot name. A weighted box has no
content floor, so text inside it wraps rather than pushing its neighbour. It
replaces `fill` and `grow` on the same box, a box takes a `span` or a `weight`,
not both, and once a `stacks` Row has stacked every weighted child is the whole
line.

```tsx
<Row stacks>
  <Column weight={1.7}>
    <Card>
      <Typography medium>The figure</Typography>
    </Card>
  </Column>
  <Column weight={1}>
    <Card>
      <Typography medium>Its legend</Typography>
    </Card>
  </Column>
</Row>
```

## Do & Don't

### Gap

**Do** — Use the gap scale so spacing tracks the kit's spacing tokens.

```tsx
<Row alignCenter snug>
  <Button primary>Save</Button>
  <Button ghost>Cancel</Button>
</Row>
```

**Don't** — Hand-roll `flexDirection` and a raw `gap`; that is a styling escape hatch.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button primary>Save</Button>
  <Button ghost>Cancel</Button>
</View>
```

### Alignment

**Do** — Reach for the main- and cross-axis booleans (`between`, `alignCenter`).

```tsx
<Row between alignCenter>
  <Typography small>Total</Typography>
  <Typography h5>$1,240.00</Typography>
</Row>
```

**Don't** — Push content around with raw `justifyContent` and `marginLeft`.

```tsx
<View style={{ flexDirection: "row" }}>
  <Text style={{ fontSize: 14, color: "#71717a" }}>Total</Text>
  <Text style={{ marginLeft: "auto", fontWeight: "600" }}>$1,240.00</Text>
</View>
```

### Overflow

**Do** — Mark the child that may give way with `shrink`, so its text wraps to the row.

```tsx
<Row between alignEnd wrap snug>
  <Column tight shrink>
    <Typography h5>Sessions</Typography>
    <Typography small muted>Every session Kratos is holding open, newest first.</Typography>
  </Column>
  <Button primary small>Revoke all</Button>
</Row>
```

**Don't** — Reach into the raw view to unstick it; that is a styling escape hatch.

```tsx
<View style={{ flexDirection: "row", justifyContent: "space-between", gap: 8 }}>
  <View style={{ flexShrink: 1, minWidth: 0 }}>
    <Text style={{ fontSize: 16, fontWeight: "600" }}>Sessions</Text>
    <Text style={{ fontSize: 13, color: "#71717a" }}>Every session Kratos is holding open, newest first.</Text>
  </View>
  <Button primary small>Revoke all</Button>
</View>
```

## Supported props

### FlexProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  |  |
| rowsTight | boolean \| undefined | no | false |  |
| rowsComfortable | boolean \| undefined | no | false |  |
| rowsSnug | boolean \| undefined | no | false |  |
| rowsCozy | boolean \| undefined | no | false |  |
| rowsSection | boolean \| undefined | no | false |  |
| rowsPanel | boolean \| undefined | no | false | A wrapped or stacked row's vertical gap of 28, apart from its main gap: the hand-off's section hero (`gap:28px 40px`), whose halves sit 40 apart beside each other and 28 apart once stacked. |
| insetIdentity | boolean \| undefined | no | false | Application identity header inset. |
| insetActions | boolean \| undefined | no | false | Application action footer inset. |
| insetTheme | boolean \| undefined | no | false | Theme controls inset. |
| insetStatus | boolean \| undefined | no | false | Status band inset. |
| insetTabs | boolean \| undefined | no | false | Navigation close controls inset. |
| fine | boolean \| undefined | no | false |  |
| dense | boolean \| undefined | no | false |  |
| compact | boolean \| undefined | no | false |  |
| close | boolean \| undefined | no | false |  |
| nested | boolean \| undefined | no | false |  |
| comfortable | boolean \| undefined | no | false |  |
| balanced | boolean \| undefined | no | false |  |
| roomy | boolean \| undefined | no | false |  |
| airy | boolean \| undefined | no | false |  |
| spacious | boolean \| undefined | no | false |  |
| generous | boolean \| undefined | no | false |  |
| section | boolean \| undefined | no | false |  |
| panel | boolean \| undefined | no | false |  |
| page | boolean \| undefined | no | false |  |
| apart | boolean \| undefined | no | false | The step between side-by-side panels of one composition (32), the hand-off's widest grid gap. |
| ample | boolean \| undefined | no | false | The step between a section page's hero and the body under it, and between the hero's halves (40): the hand-off's section pages (`gap:28px 40px` on the hero, `margin-bottom:40px` under it). |
| broad | boolean \| undefined | no | false | The gap between the two halves of a page-wide split (48): the hand-off's hero grid. |
| chapter | boolean \| undefined | no | false | The widest gap step (64): the space between a page's chapters, the major sections of a long docs page (a component detail page's Playground, Props and Examples), wider than `page` so each chapter reads as its own block. Wins over every other gap step. |
| flush | boolean \| undefined | no | false | Gap scale (pick one; default `snug`). Maps to the shared spacing tokens. |
| tight | boolean \| undefined | no | false | Gap scale (pick one; default `snug`). Maps to the shared spacing tokens. |
| snug | boolean \| undefined | no | false | Gap scale (pick one; default `snug`). Maps to the shared spacing tokens. |
| cozy | boolean \| undefined | no | false | Gap scale (pick one; default `snug`). Maps to the shared spacing tokens. |
| relaxed | boolean \| undefined | no | false | Gap scale (pick one; default `snug`). Maps to the shared spacing tokens. |
| loose | boolean \| undefined | no | false | Gap scale (pick one; default `snug`). Maps to the shared spacing tokens. |
| start | boolean \| undefined | no | false | Main-axis distribution / justifyContent (pick one; default `start`). |
| center | boolean \| undefined | no | false | Main-axis distribution / justifyContent (pick one; default `start`). |
| end | boolean \| undefined | no | false | Main-axis distribution / justifyContent (pick one; default `start`). |
| between | boolean \| undefined | no | false | Main-axis distribution / justifyContent (pick one; default `start`). |
| around | boolean \| undefined | no | false | Main-axis distribution / justifyContent (pick one; default `start`). |
| evenly | boolean \| undefined | no | false | Main-axis distribution / justifyContent (pick one; default `start`). |
| alignStart | boolean \| undefined | no | false | Cross-axis alignment / alignItems (pick one; default `stretch`, RN's native default). |
| alignCenter | boolean \| undefined | no | false | Cross-axis alignment / alignItems (pick one; default `stretch`, RN's native default). |
| alignEnd | boolean \| undefined | no | false | Cross-axis alignment / alignItems (pick one; default `stretch`, RN's native default). |
| baseline | boolean \| undefined | no | false | Cross-axis alignment / alignItems (pick one; default `stretch`, RN's native default). |
| stretch | boolean \| undefined | no | false | Cross-axis alignment / alignItems (pick one; default `stretch`, RN's native default). |
| wrap | boolean \| undefined | no | false | Orthogonal modifiers (stack freely). |
| fill | boolean \| undefined | no | false | Orthogonal modifiers (stack freely). |
| grow | boolean \| undefined | no | false | Orthogonal modifiers (stack freely). |
| shrink | boolean \| undefined | no | false | Let this box shrink below its own content width when the line runs out of room (`flexShrink: 1`), so a long text child wraps instead of overflowing. React Native gives every box `flexShrink: 0`, which is the opposite of the web's flex default: inside a Row, a Column holding a sentence keeps its MAX-CONTENT width and spills past the row's edge, where the nearest clipping ancestor cuts it mid-word. `shrink` is the opt-in that hands the row's width back to the text. Reach for it on the copy in a heading-beside-actions row, a label beside a control, any Row child whose width should follow the row rather than its own longest line. It is not `fill`. `fill` (flex: 1) also zeroes the flex BASIS, so in a `wrap` row every child then fits on one line and the actions stop wrapping below the copy; `shrink` leaves the basis at the content size, so the row still breaks where it did and only the over-wide child gives way. Redundant alongside `fill`, which already shrinks. |
| stacks | boolean \| undefined | no | false | Responsive (Row only): render as a Column when the row's own CONTAINER is at or below `stackBreakpoint` (default `sm` = 640). Container-measured with a viewport seed for the first frame, so a Row inside a narrow desktop column stacks too, not just on phones. When stacked, the Row IS the Column with the same props: gap, justify, align, and padding apply to the new axes, the default `stretch` cross-axis makes children full width, and `wrap` is inert. Ignored (with a DEV warning) on Column: a Column that must become a Row is a Row that stacks. |
| stackBreakpoint | BreakpointKey \| undefined | no |  | The breakpoint at and below which `stacks` flips to a column (default `"sm"`). Only meaningful with `stacks` (DEV warns without it). |
| span | number \| undefined | no |  | Width in twelfths of the parent Row (Bootstrap `.col-n`): `span={6}` is half the row, `span={4}` a third, `span={12}` the full width. The Row measures its own width and gives this box a px cell, gaps included in the arithmetic, so two `span={6}` children plus the gap between them fill the row exactly. Spans over twelve wrap onto the next line. A Row with `stacks` ignores spans once it has stacked (every child is then full width). Only meaningful on a direct child of a Row (DEV warns elsewhere); in a Column, a width is a Container step. A child without a span, `fill`, or `grow` hugs its content (`.col-auto`): a fill component inside it collapses, so give it one of those. |
| weight | number \| undefined | no |  | A share of the parent Row's free width, CSS grid's `minmax(0, Nfr)`: siblings with `weight={1.7}` and `weight={1}` split the row 1.7 to 1 after the gap, whatever their content, and neither holds a content floor. It is the split a ratio of twelfths cannot name (the Canvas v4 component page's anatomy is 1.7 to 1, where `span` gives 7 to 5). A positive number; it replaces `fill` and `grow` on the same box, and a box takes a `span` or a `weight`, not both. Only meaningful on a direct child of a Row (DEV warns elsewhere); once a `stacks` Row has stacked, the box is the whole line and the weight is ignored. |
| indent | boolean \| undefined | no | false | Indent the whole stack by one control gutter (24: a control box plus the row gap), so a nested option group lines up under its parent control's label instead of its box. For nesting checkboxes/radios under a "select all" parent. |
| padTight | boolean \| undefined | no | false | Padding scale (pick one; omit for none). |
| pad | boolean \| undefined | no | false | Padding scale (pick one; omit for none). |
| padLoose | boolean \| undefined | no | false | Padding scale (pick one; omit for none). |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Layout containers are the exception to the no-sizing rule: for sizing and composition only (a `maxWidth` on a shell, a `flex` inside an app frame), never for styling or spacing. Gap, margin, padding, and flex layout come from the props above, and the codegen guardrail rejects those keys in `style`. Prefer a Container step or a `span` where one fits. |

See [installation](https://canvas.nannier.com/ai/4.0.0/installation.md) for required peers and feature fallbacks.
