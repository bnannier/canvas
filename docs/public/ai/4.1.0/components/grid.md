# Grid

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 67dc17133b58d1a84056a7de4adc0eb91490ed8002a53a34897e3109a497dd42

Source: `src/atoms/grid/grid.md`
Human reference: https://canvas.nannier.com/components/grid

## Public imports

```tsx
import { Grid, GridItem } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

The container-measured auto-fit tile grid. `minTileWidth` sets the floor
(default 240): the grid fits as many equal-width columns of at least that width
as its own measured container allows, and re-fits as the container changes, so
the same grid renders three-up on a desktop, two-up on a tablet, and a single
column on a phone with no breakpoint at the call site.

`columns` caps the count at the desktop number, the gap scale is Row and
Column's own (`flush` / `tight` / `snug` / `cozy` / `relaxed` / `loose`), and a
`GridItem` child with `wide` spans two cells. The grid spans its parent's full
width (it is a FILL component, so it needs no wrapper to reach the edges), and
its tiles are equal-height as well as equal-width: every cell stretches to the
height of the row it wrapped onto, and a `Card` in a cell grows to fill it, so a
row of cards shares a flush bottom edge however unevenly their content runs (CSS
Grid's `align-items: stretch`). A field or a hug component keeps its own height.
Equal-width tiles belong here; content-sized rows that should stack at narrow
widths belong to `Row stacks`.

`flow` preserves natural card heights and the original Argus one-pixel allowance
when fitting columns. `GridItem full` spans a whole row; `raised` and `front` keep
banner and lifted-card shadows above adjacent cells. `rowsCozy` and `rowsSection`
set the vertical rhythm to 12 or 26 independently of the horizontal gap.

The shared gap scale also includes `comfortable` (10), `roomy` (14), `generous`
(22), `panel` (28), `apart` (32), `ample` (40, the step under a section page's hero) and
`broad` (48), preserving the original application layout measurements,
and Row and Column's widest step, `chapter` (64), which wins over every other step.

## Usage

```tsx
<Grid minTileWidth={220}>
  <Card title="Overview" />
  <Card title="Deploys" />
  <Card title="Alerts" />
</Grid>
```

## Variants

### Capped columns

```tsx
<Grid minTileWidth={200} columns={2}>
  <Card title="Production" />
  <Card title="Staging" />
  <Card title="Preview" />
</Grid>
```

### Wide tile

```tsx
<Grid minTileWidth={200} columns={3}>
  <GridItem wide>
    <Card title="Latency" />
  </GridItem>
  <Card title="Errors" />
  <Card title="Throughput" />
</Grid>
```

### Equal heights

Uneven content, one bottom edge: each card fills the height of its row.

```tsx
<Grid minTileWidth={200} columns={3}>
  <Card title="Uptime" description="99.98% over the last 30 days." />
  <Card title="Incidents" description="One partial outage on the EU edge, resolved in 14 minutes; a postmortem is scheduled for Thursday." />
  <Card title="On call" description="Priya, until 09:00." />
</Grid>
```

### Tight gap

```tsx
<Grid minTileWidth={160} tight>
  <Card title="CPU" />
  <Card title="Memory" />
  <Card title="Disk" />
</Grid>
```

## Do & Don't

### Column math

**Do** — Give the grid a tile floor (and optionally a desktop cap) and let it
fit its container.

```tsx
<Grid minTileWidth={220} columns={3}>
  <Card padded>
    <Typography medium>Overview</Typography>
  </Card>
  <Card padded>
    <Typography medium>Deploys</Typography>
  </Card>
  <Card padded>
    <Typography medium>Alerts</Typography>
  </Card>
</Grid>
```

**Don't** — Hand-roll percent tile widths on a wrapping Row; the column count
is then frozen at the call site and every consumer re-derives the phone
collapse by hand.

```tsx
<Row wrap snug>
  <View style={{ width: "31%" }}>
    <Card padded>
      <Typography medium>Overview</Typography>
    </Card>
  </View>
  <View style={{ width: "31%" }}>
    <Card padded>
      <Typography medium>Deploys</Typography>
    </Card>
  </View>
  <View style={{ width: "31%" }}>
    <Card padded>
      <Typography medium>Alerts</Typography>
    </Card>
  </View>
</Row>
```

## Supported props

### GridProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| flow | boolean \| undefined | no | false | Natural card heights with the original Argus subpixel width allowance. |
| rowsCozy | boolean \| undefined | no | false | Separate vertical rhythm for wrapped rows. |
| rowsSection | boolean \| undefined | no | false |  |
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
| apart | boolean \| undefined | no | false | The step between side-by-side panels of one composition (32). |
| ample | boolean \| undefined | no | false | The step between a section page's hero and its body, and between the hero's halves (40). |
| broad | boolean \| undefined | no | false | The gap between the two halves of a page-wide split (48): the hand-off's hero grid. |
| chapter | boolean \| undefined | no | false | The widest gap step (64), between a page's chapters; wins over every other step. |
| children | ReactNode | no |  |  |
| minTileWidth | number \| undefined | no | 240 | Minimum tile width in px (default 240): the grid fits as many columns of at least this width as its measured container allows (auto-fit). |
| columns | number \| undefined | no |  | Column cap: never more than this many columns (the desktop count). The count still drops below the cap as the container narrows, so a capped grid still collapses to one column on phones. |
| flush | boolean \| undefined | no | false | Gap scale (pick one; default `snug`): Row/Column's axis and precedence. |
| tight | boolean \| undefined | no | false | Gap scale (pick one; default `snug`): Row/Column's axis and precedence. |
| snug | boolean \| undefined | no | false | Gap scale (pick one; default `snug`): Row/Column's axis and precedence. |
| cozy | boolean \| undefined | no | false | Gap scale (pick one; default `snug`): Row/Column's axis and precedence. |
| relaxed | boolean \| undefined | no | false | Gap scale (pick one; default `snug`): Row/Column's axis and precedence. |
| loose | boolean \| undefined | no | false | Gap scale (pick one; default `snug`): Row/Column's axis and precedence. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | For sizing/composition only (e.g. `maxWidth` to bound the grid), never a restyle hook; layout comes from the props above. |

### GridItemProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| full | boolean \| undefined | no | false | Span the whole row. |
| raised | boolean \| undefined | no | false | Stack above adjacent resting cells. |
| front | boolean \| undefined | no | false | Stack above a raised banner while lifting. |
| children | ReactNode | no |  |  |
| wide | boolean \| undefined | no | false | Span two cells when the grid has more than one column (a hero tile). One cell in a one-column grid. |
| testID | string \| undefined | no |  | E2E hook forwarded to the item element. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
