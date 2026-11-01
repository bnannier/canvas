# Kbd

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 63292636c7ff2f224185aef7c96ac78124f9170a170b90ee11718addfa280643

Source: `src/atoms/kbd/kbd.md`
Human reference: https://canvas.nannier.com/components/kbd

## Public imports

```tsx
import { Kbd } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Keyboard shortcut indicator: a raised 24 px key cap with a mono label. `keys`
composes a whole shortcut, one cap per key; `sequence` says "then" between the
caps of keys pressed one after another. A shortcut reads as one accessible name
("⌘+K", "G then C"). `comfortable` pads the cap 3 px above and below its label and
8 px at the sides (25 px tall) for a key set beside what it does, as a reference's
keyboard table lists it; omit it for the 24 px cap with 6 px sides.

Two compact sizes take the cap down for a hint beside a field or a menu: `small`, the
22 px cap with 6 px sides at a 5 px corner and a 500 11 px label, and `tiny`, the 20 px cap
with 5 px sides at a 4 px corner and a 500 10 px label. Size precedence is `small`, then
`tiny`, and a size step wins over `comfortable`. `flat` is the hint cap's edge: one pixel
all round instead of the raised 2 px bottom, and the label in the secondary ink. An
`Input` draws its `shortcut` hint as `<Kbd small flat>` (`tiny` on a small field).

## Usage

```tsx
<Kbd keys="⌘ K" />
```

## Variants

### Single

```tsx
<Kbd>Esc</Kbd>
```

### Combo

```tsx
<Kbd keys="⌘ ⇧ P" />
```

### Sequence

```tsx
<Kbd keys="G C" sequence />
```

### Comfortable

```tsx
<Row alignCenter snug>
  <Kbd comfortable>Enter</Kbd>
  <Typography small muted>Activates</Typography>
</Row>
```

### Compact hint

```tsx
<Row alignCenter snug>
  <Kbd small flat>⌘K</Kbd>
  <Kbd tiny flat>⌘K</Kbd>
  <Kbd small flat>esc</Kbd>
</Row>
```

### In a button

```tsx
<Button outline iconRight={<Kbd keys="⌘ K" />}>Search…</Button>
```

### In a sentence

```tsx
<Row alignCenter tight>
  <Typography small>Press </Typography>
  <Kbd keys="⌘ K" />
  <Typography small> to search.</Typography>
</Row>
```

## Do & Don't

### Single

**Do**: Use `children` for one real key; give each cap exactly one key.

```tsx
<Kbd>Esc</Kbd>
```

**Don't**: Packing a whole shortcut into one key cap reads as a single keystroke that does not exist.

```tsx
<Kbd>⌘K</Kbd>
```

### Combo

**Do**: Pass every key to `keys`; Kbd lays out the caps and reads as one shortcut to a screen reader.

```tsx
<Kbd keys="⌘ ⇧ P" />
```

**Don't**: Hand-assembling caps and separators is verbose and drops the combined accessible name; let `keys` compose the chord.

```tsx
<Row alignCenter tight>
  <Kbd>⌘</Kbd>
  <Typography tiny muted>+</Typography>
  <Kbd>⇧</Kbd>
  <Typography tiny muted>+</Typography>
  <Kbd>P</Kbd>
</Row>
```

### In a sentence

**Do**: Drop a `keys` Kbd inline so the shortcut reads as physical keys.

```tsx
<Row wrap alignCenter tight>
  <Typography small>Press </Typography>
  <Kbd keys="Ctrl K" />
  <Typography small> to search.</Typography>
</Row>
```

**Don't**: Plain-text shortcuts blend into the prose and are easy to miss.

```tsx
<Typography small>Press Ctrl+K to search.</Typography>
```

## Supported props

### KbdProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | A single key label, rendered as one cap. Ignored when `keys` is set. |
| keys | string \| string[] \| undefined | no |  | A multi-key shortcut (a combo, pressed together), rendered as one cap per key. Pass a whitespace-separated string (`"⌘ K"`) or an array (`["⌘", "K"]`). A single entry renders one cap, identical to passing that key as `children`. When set, `keys` takes precedence over `children`. |
| sequence | boolean \| undefined | no | false | Render a key SEQUENCE (press one, then the next): the caps are separated by "then". Only affects the `keys` form. |
| comfortable | boolean \| undefined | no | false | The comfortable cap: padded 3 px above and below its label and 8 px at the sides (25 px tall), the key the hand-off's component page sets beside a key's effect. Omit for the 24 px cap with 6 px sides. |
| small | boolean \| undefined | no | false | The compact 22 px cap: 6 px sides on the small key corner, a 500 11 px label on a 20 px line (the hint a search field or a command palette shows, `<Kbd small flat>`). Size precedence: `small` > `tiny`; a size step wins over `comfortable`. |
| tiny | boolean \| undefined | no | false | The compact 20 px cap: 5 px sides on the tiny key corner, a 500 10 px label on an 18 px line. |
| flat | boolean \| undefined | no | false | The hint cap's edge: one pixel all round (no raised 2 px bottom) and the label in the secondary ink, the keycap a field or a menu shows beside what it opens. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
