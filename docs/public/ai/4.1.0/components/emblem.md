# Emblem

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4142cc0e5e2e3b6d409e4f7eb0338822b95078cff8102a18cf5c33a42834366a

Source: `src/atoms/emblem/emblem.md`
Human reference: https://canvas.nannier.com/components/emblem

## Public imports

```tsx
import { Emblem } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A tinted rounded square (or circle) that holds a single `Icon` or a short
monogram, the recurring "icon on a soft background" used in cards, media objects,
empty states, and feeds. Emblem owns the surface and the icon color: pick a tone
and it tints the square and paints the glyph to match, so a call site never
hand-composes `borderRadius` + `backgroundColor` to build an icon background.

## Usage

```tsx
<Emblem>
  <Icon shield />
</Emblem>
```

## Variants

### Tones

```tsx
<Row snug>
  <Emblem primary><Icon shield /></Emblem>
  <Emblem success><Icon check /></Emblem>
  <Emblem warning><Icon circleAlert /></Emblem>
  <Emblem destructive><Icon trash /></Emblem>
  <Emblem muted><Icon bell /></Emblem>
</Row>
```

The precedence is `primary` > `destructive` > `success` > `warning` > `cyan` >
`secondary` > `muted` (the default).

### Cyan and secondary

`cyan` mixes the tile from the fixed cyan series hue (`chart-2`, the same whatever the
palette), its glyph in the hue's solved ink. `secondary` is the solid neutral tile: the
`secondary` fill inside the hairline, the glyph in the second ink, with no lit edge.

```tsx
<Row snug>
  <Emblem cyan circle><Icon globe /></Emblem>
  <Emblem secondary><Icon layers /></Emblem>
</Row>
```

### Sizes

```tsx
<Row snug alignCenter>
  <Emblem small><Icon bell /></Emblem>
  <Emblem><Icon bell /></Emblem>
  <Emblem large><Icon bell /></Emblem>
</Row>
```

### Monogram

```tsx
<Emblem label="U" />
```

### Circle

```tsx
<Emblem circle>
  <Icon check />
</Emblem>
```

### Soft

`soft` is the plain tone tile a dialog draws over its title: the tone's own soft wash,
with no ring and no lit edge, at a 12 px corner. It composes with every tone and size.

```tsx
<Row snug>
  <Emblem primary soft><Icon arrowUpRight /></Emblem>
  <Emblem destructive soft><Icon trash2 /></Emblem>
</Row>
```

## Do & Don't

### Surface

**Do**: Use Emblem so the tint and icon color stay in sync from one tone prop.

```tsx
<Emblem primary>
  <Icon shield />
</Emblem>
```

**Don't**: Hand-compose the tinted square with raw `borderRadius`, `backgroundColor`, and padding.

```tsx
<View style={{ height: 40, width: 40, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "rgba(79,70,229,0.1)" }}>
  <Icon shield primary />
</View>
```

## Supported props

### EmblemProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | A single `<Icon />` element; Emblem tints it to match the tone. |
| label | string \| undefined | no |  | A monogram letter (or two) instead of an icon, painted in the tone color. |
| primary | boolean \| undefined | no | false | Tone (pick one; default `muted`). Sets the tinted surface and the icon color. Precedence: primary > destructive > success > warning > cyan > secondary > muted. |
| destructive | boolean \| undefined | no | false | Tone (pick one; default `muted`). Sets the tinted surface and the icon color. Precedence: primary > destructive > success > warning > cyan > secondary > muted. |
| success | boolean \| undefined | no | false | Tone (pick one; default `muted`). Sets the tinted surface and the icon color. Precedence: primary > destructive > success > warning > cyan > secondary > muted. |
| warning | boolean \| undefined | no | false | Tone (pick one; default `muted`). Sets the tinted surface and the icon color. Precedence: primary > destructive > success > warning > cyan > secondary > muted. |
| cyan | boolean \| undefined | no | false | The fixed cyan hue (the hand-off's `--cyan`, the `chart-2` series): its wash and ring mixed from it, the glyph in the hue's ink, solved to 4.5:1 per scheme (Typography's `cyan`). |
| secondary | boolean \| undefined | no | false | The solid neutral tile: the `secondary` fill inside the `border` hairline, the glyph in the second ink (`muted-foreground`), with no lit top edge (the hand-off's neutral tile). |
| muted | boolean \| undefined | no | false |  |
| small | boolean \| undefined | no | false | Size (pick one; default medium). |
| large | boolean \| undefined | no | false | Size (pick one; default medium). |
| circle | boolean \| undefined | no | false | Circle instead of the default rounded square. |
| soft | boolean \| undefined | no | false | The plain soft tile: the tone's own soft wash (`primary-soft`, `destructive-soft`, ...) with no ring and no lit top edge, at the soft tile's own corner. The tone tile a dialog draws over its title (the v4 hand-off's AlertDialog renderer, `--ion-soft` / `--bad-soft`). Composes with the tone and size axes. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | For layout composition only (not styling): the tint, radius, and size come from props. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
