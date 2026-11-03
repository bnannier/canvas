# Swatch

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: e09f8965dff7d0af07ba1dd1deaa62611de669dfcb059d93145325e8bdbb1cbc

Source: `src/atoms/swatch/swatch.md`
Human reference: https://canvas.nannier.com/components/swatch

## Public imports

```tsx
import { Swatch } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A color sample: a filled rounded block with the token's name and value beneath
it, the anatomy a design-system color sheet repeats down a page. Swatch owns the
whole lockup, so a sheet never sets a bare block next to a hand-built text
column and drifts row to row.

Pass a live theme token as `color` and the sample follows the active scheme; a
hairline edge keeps a white or near-black sample visible on the surface behind
it. The chip is 48px at a 12px corner (32 `small`, 72 `large`, and 20 `tiny`,
the disc of a token Chip), the name a 13px line and the value lines 11px mono
in the subtle ink; the lockup also comes as a `circle`, `inline` (the label
beside the block), or as a `block` (a full-width ramp bar). `ring` draws the
edge as a 1px inset ring in the field border instead of the hairline, the token
chip's swatch. `selected` marks the chosen sample with the selection ring, a
2px gap in the page color and then a 2px accent band, and adds "selected" to
its accessible name. `decorative` hides a sample from assistive tech when text
beside it already names it (a theme choice's disc before its label), so the
name is read once.

A palette picker takes one of the kit's five accent palettes, `violet`, `cyan`,
`mint`, `rose` or `amber` (ThemeProvider's precedence: cyan, mint, rose, amber,
violet), with `selected` and `onPress`. It is a 16px disc of the palette's hue,
the same in both schemes, and a radio named for its palette ("Violet"). The
palette in force wears the selection ring, a 2px gap in the card color and then
a 2px muted-foreground band; the others draw none. On the web a hovered disc
grows to 1.25 times its size. A size boolean sizes the disc to that sample edge
(`small` is a 32px disc, the size a form's hue choice takes). Put the pickers in
a `radiogroup` so the set reads as one choice. A plain sample still uses `color`.

The section page's samples come as forms and lockups of the same component. `tile` is
the labelled colour tile, the parent's width and 64 px tall (40 `small`), its name set
inside the fill on one line (ellipsized where it outgrows the tile, its accessible name
whole) in the 11 px code face at an 8 px inset, at the foot (centred `small`),
in the `ink` it is given. `bar` is a colour bar, the parent's width at 26 px and a 7 px
corner. `steps` takes a list of colours in place of `color` and draws one bar of them,
flush and clipped at a 10 px corner at the size's height; `segmented` stands them 4 px
apart in a 28 px bar, each at a 3 px corner but for the bar's two outer ends at 7. The
form precedence is `tile` > `bar` > `circle`, and a `steps` list wins over all three.
`fluid` makes the chip's edge the parent's width, held 1:1; `glow` lays the fill's own
light under the chip; `centered` centres the label column 10 px under the chip; `bare`
drops the resting edge from a fill that needs none; and `compact` is the mono lockup, the
name 500 12 px and the value 400 10 px in the code face, each on one line (ellipsized in a
narrow column), 6 px apart and 6 px under a 56 px `block`.

## Usage

```tsx
<Swatch color={tokens.primary} value="--primary">
  primary
</Swatch>
```

## Variants

### Sizes

```tsx
<Row>
  <Swatch tiny color={tokens.info}>info</Swatch>
  <Swatch small color={tokens.primary}>primary</Swatch>
  <Swatch color={tokens.success}>success</Swatch>
  <Swatch large color={tokens.destructive}>destructive</Swatch>
</Row>
```

### Circle

```tsx
<Swatch circle color={tokens.primary}>primary</Swatch>
```

### Ring

The token chip's swatch: a 20px disc edged by a 1px inset ring.

```tsx
<Row snug alignCenter>
  <Swatch tiny ring circle color={tokens.card} accessibilityLabel="card" />
  <Swatch tiny ring circle color={tokens.primary} accessibilityLabel="primary" />
  <Swatch tiny ring circle color={tokens.background} accessibilityLabel="background" />
</Row>
```

### Inline

```tsx
<Swatch inline color={tokens.primary}>primary</Swatch>
```

### Block

```tsx
<Swatch block color={tokens.primary}>primary</Swatch>
```

### Spectrum

```tsx
<Row cozy>
  <Column fill><Swatch fluid circle glow centered bare color={tokens["chart-1"]} value="285" /></Column>
  <Column fill><Swatch fluid circle glow centered bare color={tokens["chart-2"]} value="205" /></Column>
  <Column fill><Swatch fluid circle glow centered bare color={tokens["chart-3"]} value="165" /></Column>
</Row>
```

### Tiles

```tsx
<Column snug>
  <Row snug>
    <Column fill><Swatch tile bare color={tokens.primary} ink={tokens["primary-foreground"]}>primary</Swatch></Column>
    <Column fill><Swatch tile bare color={tokens.success} ink={tokens["success-foreground"]}>success</Swatch></Column>
  </Row>
  <Row snug>
    <Column fill><Swatch tile small bare color={tokens["primary-soft"]} ink={tokens.primary}>primary-soft</Swatch></Column>
    <Column fill><Swatch tile small bare color={tokens["success-soft"]} ink={tokens.success}>success-soft</Swatch></Column>
  </Row>
</Column>
```

### Bar

```tsx
<Swatch bar inline color={tokens.secondary} value={tokens.secondary} />
```

### Steps

```tsx
<Column cozy>
  <Swatch block small steps={[tokens["chart-1"], tokens["chart-2"], tokens["chart-3"], tokens["chart-4"]]} accessibilityLabel="Ramp" />
  <Swatch segmented steps={[tokens["chart-1"], tokens["chart-2"], tokens["chart-3"], tokens["chart-4"]]} accessibilityLabel="Series" />
</Column>
```

### Compact

```tsx
<Row comfortable>
  <Column fill><Swatch block compact bare color={tokens.primary} value="primary">ion</Swatch></Column>
  <Column fill><Swatch block compact color={tokens.secondary} value="recess">secondary</Swatch></Column>
</Row>
```

### Selected

```tsx
<Row relaxed>
  <Swatch selected color={tokens.primary} value="--primary">primary</Swatch>
  <Swatch color={tokens.success} value="--success">success</Swatch>
</Row>
```

### Detail line

```tsx
<Swatch color={tokens.primary} value="--primary" detail="oklch(0.511 0.262 276.966)">
  primary
</Swatch>
```

### Palette picker

```tsx
<View role="radiogroup" aria-label="Palette">
  <Row snug alignCenter>
    <Swatch violet selected onPress={() => {}} />
    <Swatch cyan onPress={() => {}} />
    <Swatch mint onPress={() => {}} />
    <Swatch rose onPress={() => {}} />
    <Swatch amber onPress={() => {}} />
  </Row>
</View>
```

### Form-sized palette picker

```tsx
<View role="radiogroup" aria-label="Accent hue">
  <Row comfortable alignCenter>
    <Swatch small circle violet selected onPress={() => {}} />
    <Swatch small circle cyan onPress={() => {}} />
    <Swatch small circle mint onPress={() => {}} />
  </Row>
</View>
```

## Do & Don't

### Anatomy

**Do**: Let Swatch carry the name and the value, so every row of a sheet keeps one lockup and one accessible name.

```tsx
<Swatch color={tokens.primary} value="--primary">
  primary
</Swatch>
```

**Don't**: Set a bare block beside a hand-composed text column: the spacing and the type scale drift row to row, and the sample ships as an unnamed block.

```tsx
<Row snug alignCenter>
  <View style={{ height: 56, width: 56, borderRadius: 8, backgroundColor: "#4f46e5" }} />
  <Column tight>
    <Typography small medium>primary</Typography>
    <Typography tiny subtle>--primary</Typography>
  </Column>
</Row>
```

### Color source

**Do**: Pass the live token, so the sample repaints when the scheme flips.

```tsx
<Swatch color={tokens.card} value="--card">
  card
</Swatch>
```

**Don't**: Hard-code the value a token resolves to; the sample keeps showing the light color after the scheme flips to dark.

```tsx
<Swatch color="#ffffff" value="#ffffff">
  card
</Swatch>
```

## Supported props

### SwatchProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| color | string \| undefined | no |  | The fill: any React Native color string. Pass a theme token, not a literal. |
| violet | boolean \| undefined | no | false | Palette picker (pick one): the sample becomes the 16 px hue disc of that accent palette, a radio named for it (a size boolean sizes the disc to that sample edge: `small` is 32 px). Precedence is ThemeProvider's: cyan, mint, rose, amber, violet. |
| cyan | boolean \| undefined | no | false | Palette picker (pick one): the sample becomes the 16 px hue disc of that accent palette, a radio named for it (a size boolean sizes the disc to that sample edge: `small` is 32 px). Precedence is ThemeProvider's: cyan, mint, rose, amber, violet. |
| mint | boolean \| undefined | no | false | Palette picker (pick one): the sample becomes the 16 px hue disc of that accent palette, a radio named for it (a size boolean sizes the disc to that sample edge: `small` is 32 px). Precedence is ThemeProvider's: cyan, mint, rose, amber, violet. |
| rose | boolean \| undefined | no | false | Palette picker (pick one): the sample becomes the 16 px hue disc of that accent palette, a radio named for it (a size boolean sizes the disc to that sample edge: `small` is 32 px). Precedence is ThemeProvider's: cyan, mint, rose, amber, violet. |
| amber | boolean \| undefined | no | false | Palette picker (pick one): the sample becomes the 16 px hue disc of that accent palette, a radio named for it (a size boolean sizes the disc to that sample edge: `small` is 32 px). Precedence is ThemeProvider's: cyan, mint, rose, amber, violet. |
| selected | boolean \| undefined | no | false | The sample is the chosen one: draws the selection ring (a 2 px gap in the page color, then a 2 px band). On a plain sample the band is the accent and the name says "selected"; on a palette picker it is the one in force and the radio is checked. |
| onPress | (() => void) \| undefined | no |  | Palette picker: pick this palette. |
| children | ReactNode | no |  | The sample's name (the token name). Swatch owns this label column. |
| value | string \| undefined | no |  | Primary mono line under the name: what the name resolves to (a hex, a custom-property name, a ramp step). |
| detail | string \| undefined | no |  | Secondary mono line under the value, for a second notation of the same color (an oklch value, a legacy alias). |
| tiny | boolean \| undefined | no | false | The 20 px disc of a token chip (`<Chip token icon={<Swatch tiny ring circle />}>`). |
| small | boolean \| undefined | no | false |  |
| large | boolean \| undefined | no | false |  |
| circle | boolean \| undefined | no | false | Circle instead of the default rounded square. Keeps the 1:1 footprint, so it wins over `block`'s stretch. |
| ring | boolean \| undefined | no | false | Draws the token chip's hairline INSIDE the sample, a 1 px inset ring in the field border, in place of the resting hairline edge; a selected sample keeps its selection ring outside it. |
| inline | boolean \| undefined | no | false | Put the label column beside the block instead of under it. |
| block | boolean \| undefined | no | false | Stretch the block to the parent's width; the size then reads as its height (the full-width ramp bar). |
| tile | boolean \| undefined | no | false | The labelled colour tile: the parent's width, 64 px tall (40 `small`), its name set inside the fill on one line (ellipsized where it outgrows the tile) at an 8 px inset in the 11 px mono face, at the foot (centred `small`). `ink` paints the name; the value lines are read into the accessible name only. |
| bar | boolean \| undefined | no | false | A colour bar: the parent's width, 26 px tall at the swatch bar corner (a neutral role's sample). |
| steps | readonly string[] \| undefined | no |  | One bar of colour steps in place of `color`, flush and clipped at the ramp corner at the size's height (`block small` is the 32 px accent ramp); `segmented` stands them apart. |
| segmented | boolean \| undefined | no | false | `steps` as separate segments: a 28 px bar, 4 apart, the step corner inside and the bar corner at its ends. |
| fluid | boolean \| undefined | no | false | The chip's edge is the parent's width, held 1:1 (a spectrum's discs filling their cells). |
| glow | boolean \| undefined | no | false | The fill's own ambient light under the chip (`0 12px 30px -8px`, the fill at .6). |
| centered | boolean \| undefined | no | false | The label column centred under the chip, 10 px below it. |
| bare | boolean \| undefined | no | false | No resting edge: the sample sits on its fill alone (a saturated fill that needs no hairline). |
| compact | boolean \| undefined | no | false | The mono lockup: the name 500 12 px and the value 400 10 px in the code face, each on one line (ellipsized where it outgrows a narrow column), 6 px apart and 6 px under the chip; a `block` chip is 56 px tall. |
| ink | string \| undefined | no |  | The `tile` name's ink, a theme token like `color` (default the foreground). |
| accessibilityLabel | string \| undefined | no |  | Accessible name override. By default the sample names itself from its own name, value, and detail (falling back to the color string), so pass this only when the name is a node rather than text and there is nothing to read. |
| decorative | boolean \| undefined | no | false | The sample is decoration beside text that already names it (a theme choice's disc before its label): hidden from assistive tech, so the text carries the name once. Pass it in place of `accessibilityLabel`. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For layout composition only (not styling): the fill, radius, and size come from props. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
