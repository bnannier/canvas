# Listbox

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 1b984bdfad247d053ab7f82ef582b919717b61d8c09c675992bf5d3da2781cec

Source: `src/atoms/listbox/listbox.md`
Human reference: https://canvas.nannier.com/components/listbox

## Public imports

```tsx
import { Listbox } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A custom select whose options stay on screen: single or multi-select, an optional detail line under each option, and a checkmark on the chosen items. Reach for it when the options need rich rows; prefer `Select` for a simple short list.

The list fills the parent it is given; a step of its own (`xs`, `lg`, …, with `start` to pin it to the leading edge) or a Container step sets its measure.

Neither iOS nor Material 3 ships a listbox, so every platform draws the Canvas v4 list, in its own face:
a chosen row sits on the accent's soft wash with a 16px check at its end in the accent ink, in single and multi select alike, and the check's slot is kept on every row so a choice never reflows a label.

The rows are 10px in with a 500 14/18.2px label (13px small) over a 400 12/16.2px detail in the subtle ink, rounded concentric inside a bordered list, which is the `popover` fill behind the `field-border` hairline at the tile corner with a 4px inset. A pressed row takes the `muted` wash, and on the web a row under the pointer takes the hover wash at once.

Single-select exposes a list of selectable options. With `multi`, it exposes a checkbox group: each row owns its label, checked state, and tap target. Give either mode a meaningful `accessibilityLabel`; the fallback is "Options". Arrow keys and Home/End move focus within one tab stop. Single-select follows focus, while multi-select keeps the current selection until Enter or Space toggles the focused row.

## Usage

```tsx
<Listbox
  accessibilityLabel="Teams"
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design" }
  ]}
/>
```

## Variants

### Multi

```tsx
<Listbox
  accessibilityLabel="Teams"
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design", selected: true }
  ]}
  multi
/>
```

### Small

```tsx
<Listbox
  accessibilityLabel="Teams"
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design" }
  ]}
  small
/>
```

### Large

```tsx
<Listbox
  accessibilityLabel="Teams"
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design" }
  ]}
  large
/>
```

### Disabled

```tsx
<Listbox
  accessibilityLabel="Teams"
  items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design" }
  ]}
  disabled
/>
```

### Detail line

```tsx
<Listbox
  accessibilityLabel="People"
  items={[
    { label: "Rachel Chen", detail: "rachel@acme.io", selected: true },
    { label: "Ada Lovelace", detail: "ada@acme.io" },
    { label: "Kevin Turner", detail: "kevin@acme.io" }
  ]}
/>
```

### Measure

```tsx
<Column snug>
  <Listbox xs start bordered items={[{ label: "xs step, pinned to the start (320)", selected: true }, { label: "Frontend" }]} />
  <Listbox lg start bordered items={[{ label: "lg step, pinned to the start (512)", selected: true }, { label: "Frontend" }]} />
  <Container lg start><Listbox bordered items={[{ label: "Bare, in an lg Container: fills it (512)", selected: true }, { label: "Frontend" }]} /></Container>
</Column>
```

## Do & Don't

### Prefer a native select for simple lists

**Do**: For short, plain lists a native select is lighter, accessible, and uses the platform picker on mobile.

```tsx
<Select defaultValue="Yes" options={["Yes", "No"]} />
```

**Don't**: A custom listbox for two short options is heavier than it needs to be and worse on mobile.

```tsx
<Listbox bordered items={[
    { label: "Yes", selected: true },
    { label: "No" }
  ]} />
```

### single

**Do**: Show exactly one checkmark, mirror it in the trigger value, and close the panel on pick.

```tsx
<Listbox bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend" },
    { label: "Design" },
    { label: "Platform" }
  ]} />
```

**Don't**: Single-select with two checkmarks lies about state: only one option can be the value.

```tsx
<Listbox bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform" }
  ]} />
```

### multi

**Do**: Keep the panel open, toggle each option's own checkmark, and summarize the count in the trigger.

```tsx
<Column tight>
  <Select defaultValue="3 selected" />
  <Listbox multi bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform", selected: true }
  ]} />
</Column>
```

**Don't**: Don't close on each pick or echo only the last choice: multi-select needs to keep all selections visible.

```tsx
<View style={{ width: 224, gap: 4 }}>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12, height: 36 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Backend</Text>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>▾</Text>
  </View>
  <Listbox multi bordered items={[
    { label: "Backend", selected: true },
    { label: "Frontend", selected: true },
    { label: "Design" },
    { label: "Platform", selected: true }
  ]} />
</View>
```

## Supported props

### ListboxProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | ListboxItem[] | yes |  | The options to render, top to bottom. |
| accessibilityLabel | string \| undefined | no |  | Accessible name of the option list or multi-select checkbox group. Defaults to "Options". |
| multi | boolean \| undefined | no | false | Multi-select: each row is a checkbox (a leading indicator on the web and Android, a trailing ✓ on iOS) instead of a single choice. |
| bordered | boolean \| undefined | no | false | Wrap the list in a rounded, bordered content card with static glass in glass mode. |
| small | boolean \| undefined | no | false | Tighter rows with smaller text. |
| large | boolean \| undefined | no | false | Taller rows. |
| disabled | boolean \| undefined | no | false | Dim the list and block selection. |
| selected | number \| number[] \| undefined | no |  | Selected option index(es) (CONTROLLED): a single index in single-select, an array of indices in multi-select. Omit for uncontrolled use. |
| defaultSelected | number \| number[] \| undefined | no |  | Initial selection for uncontrolled use (a bare listbox selects on press). Falls back to the `selected` flags on `items` when omitted. |
| onChange | ((selected: number \| number[]) => void) \| undefined | no |  | Fired with the full new selection (an index in single-select, an index array in multi). |
| onSelect | ((index: number) => void) \| undefined | no |  | Fired with the pressed option's index. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root list view. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| xxxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xs | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| sm | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| md | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| lg | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| xxxl | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wide | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| wider | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| widest | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| page | boolean \| undefined | no | false | Measure (pick one; omit to take the parent's bounds). Caps the component at a step of the width scale, centered in its column; `start` pins it to the leading edge. |
| start | boolean \| undefined | no | false | Pin a capped component to the leading edge instead of centering it in its column. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
