# Select

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 4142cc0e5e2e3b6d409e4f7eb0338822b95078cff8102a18cf5c33a42834366a

Source: `src/atoms/select/select.md`
Human reference: https://canvas.nannier.com/components/select

## Public imports

```tsx
import { Select } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A single-choice dropdown field: a trigger showing the chosen value that opens a
panel of options, styled to match Canvas inputs.

Pass `label` (and `required`) to name the field:
iOS and web render the label
above the trigger, while Android floats the Material 3 in-container label once
the menu opens or a value is selected. On Android the trigger grows with the
user's text size, and a label longer than the trigger truncates on one line clear
of the chevron while the trigger's accessible name stays the whole label.
The trigger fills the parent it is given;
a step of its own (`xs`, `lg`, …, with `start` to pin it to the leading edge) or
a Container step sets its measure.

In glass mode the option panel is a dense-layer glass card under the trigger (or
above it when it fits there); the trigger stays in place with its value and
chevron, and the chosen value and expanded state commit immediately. Solid mode
paints the skin's own panel.

The label also names the option list. Use `accessibilityLabel` to provide an explicit purpose when the visible label or placeholder is insufficient; it overrides both accessible names. A required field announces "required" with the button name and marks the option list as required. The selected value never replaces the field's purpose.

Pass `ref` to access the interactive trigger, preserving overlay measurement. Use `useRef<ComponentRef<typeof Select>>(null)` from React, or `useRef<View>(null)` with React Native's `View` type. Object and callback refs are supported and detach on unmount. Calling `ref.current?.focus()` or `.blur()` delegates to the host without activating the control. Browser focus is supported; native focus depends on the platform and React Native version, and is separate from accessibility focus.

On web, the trigger is the Canvas v4 field: 40 pixels tall (32 small, 48 large)
on the sunken fill behind the `field-border` hairline, a 400 14-pixel value (13
small) and a 16-pixel chevron that turns over while the list is open. The pointer
darkens the edge to the subtle ink, and keyboard focus or the open list rings it in
the accent with a 4-pixel halo. The list is a card 6 pixels under the trigger with
a 4-pixel inset, 34-pixel rows, the chosen row on the `muted` wash with a trailing
check in the accent ink.
iOS keeps the pop-up button (a 44-point field with the
up-and-down chevrons) and its menu, which marks the chosen row with a leading check;
Android keeps the Material 3 exposed dropdown, whose menu marks the chosen row with
its state layer alone.

Use `dense eyebrow soft` for the compact application field on web: a 32-pixel
trigger with a 600 13-pixel value under a tracked uppercase eyebrow label at the
kit’s 10-pixel reading floor, and 30-pixel rows. `plainOptions` removes the check
and marks the chosen row with its wash alone; pointer hover uses the brand wash. `steadyPress` keeps the resting fill and
opacity while pressed. `menuWidth` bounds the floating menu independently of the
field. `combobox` exposes the selection-field role. Native skins keep their
platform field anatomy and minimum touch targets.

## Usage

```tsx
<Select label="Country" defaultValue="United States" options={["United States", "Canada", "Mexico"]} />
```

## Variants

### Dense field

```tsx
<Select dense eyebrow soft plainOptions steadyPress menuWidth={260} label="Role" defaultValue="Developer" options={["Architect", "Developer", "Reviewer"]} />
```


### Inline label

```tsx
<Select inline label="Rows" defaultValue="10" options={["10", "25", "50"]} />
```

### Required field

```tsx
<Select label="Country" required defaultValue="United States" options={["United States", "Canada", "Mexico"]} />
```

### Small

```tsx
<Select small label="Country" defaultValue="United States" options={["United States", "Canada", "Mexico"]} />
```

### Large

```tsx
<Select large label="Country" defaultValue="United States" options={["United States", "Canada", "Mexico"]} />
```

### Country

```tsx
<Select
  label="Country"
  defaultValue="US"
  options={[
    { value: "US", label: "United States", leading: "🇺🇸" },
    { value: "CA", label: "Canada", leading: "🇨🇦" },
    { value: "GB", label: "United Kingdom", leading: "🇬🇧" },
    { value: "DE", label: "Germany", leading: "🇩🇪" },
    { value: "JP", label: "Japan", leading: "🇯🇵" },
  ]}
/>
```

### With leading icon

```tsx
<Select icon label="Country" defaultValue="United States" options={["United States", "Canada", "Mexico"]} />
```

### Disabled

```tsx
<Select disabled label="Country" defaultValue="United States" options={["United States", "Canada", "Mexico"]} />
```

### Measure

```tsx
<Column snug>
  <Select xs start options={["Small", "Medium", "Large"]} placeholder="xs step, pinned to the start (320)" />
  <Select lg start options={["Small", "Medium", "Large"]} placeholder="lg step, pinned to the start (512)" />
  <Container lg start><Select options={["Small", "Medium", "Large"]} placeholder="Bare, in an lg Container: fills it (512)" /></Container>
</Column>
```

## Do & Don't

### Placeholder

**Do** — Use the placeholder prop for the prompt so it can never be submitted as a value.

```tsx
<Column style={{ minHeight: 220 }}>
  <Select open label="Country" placeholder="Choose a country…" options={["United States", "Canada", "Mexico"]} />
</Column>
```

**Don't** — A placeholder as a normal option can be submitted as a real value.

```tsx
<View style={{ minHeight: 260 }}>
  <Select open label="Country" defaultValue="Choose a country…" options={["Choose a country…", "United States", "Canada", "Mexico"]} />
</View>
```

### When to use

**Do** — Reserve a select for picking one of several mutually exclusive options; use a switch or radios for two.

```tsx
<Select label="Status" options={["Active", "Inactive", "Pending", "Archived"]} defaultValue="Active" />
```

**Don't** — A select for a single on/off choice buries a one-tap decision behind a dropdown.

```tsx
<Select label="Email notifications" options={["On", "Off"]} defaultValue="On" />
```

### Small

**Do** — Keep the small select inline with a short label so it stays compact inside toolbars and table footers.

```tsx
<Select small inline label="Rows" defaultValue="10" options={["10", "25", "50"]} />
```

**Don't** — A stacked block label towers over the small control and breaks the dense row it belongs in.

```tsx
<Select small label="Rows per page" defaultValue="10" options={["10", "25", "50"]} />
```

### Default size

**Do** — Match the default select to sibling inputs at the same height so the form row lines up.

```tsx
<Row alignEnd cozy>
  <Column fill>
    <Input label="City" defaultValue="Austin" />
  </Column>
  <Column fill>
    <Select label="State" defaultValue="Texas" options={["Texas", "Oregon"]} />
  </Column>
</Row>
```

**Don't** — A default select next to a taller lg input leaves the row baselines misaligned.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12, maxWidth: 420 }}>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>City</Text>
    <Input large accessibilityLabel="City" value="Austin" />
  </View>
  <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>State</Text>
    <Select value="Texas" options={["Texas", "Oregon"]} />
  </View>
</View>
```

### Large

**Do** — Scale the text up with the height so the large select reads as a deliberate, touch-friendly target.

```tsx
<Select large label="Plan" defaultValue="Starter" options={["Starter", "Pro", "Enterprise"]} />
```

**Don't** — Tiny option text inside a tall control wastes the height and looks like an accidental mismatch.

```tsx
<View>
  <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Plan</Text>
  <Pressable style={{ height: 40, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }} accessibilityRole="button">
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens.foreground }}>Starter</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>▾</Text>
  </Pressable>
</View>
```

## Supported props

### SelectProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| value | string \| undefined | no |  | Controlled selection; omit for uncontrolled use. Empty shows the placeholder. With plain string options this is the option itself; with `SelectOption` objects it is the option's `value`, and the trigger shows its `label`. |
| defaultValue | string \| undefined | no |  | Initial selection for uncontrolled use (a bare <Select options/> picks on its own). |
| options | (string \| SelectOption)[] \| undefined | no |  | The selectable options: bare strings, or `{ value, label }` objects when the stored value differs from the text shown for it. |
| label | string \| undefined | no |  | The field's persistent label. Its placement is platform-adaptive: iOS and web render it ABOVE the trigger; Android renders the Material 3 in-container FLOATING label (centered like a placeholder at rest, floating to the top once the menu opens or a value is selected). The label names the field for a11y. |
| accessibilityLabel | string \| undefined | no |  | Accessible purpose for the trigger and option list. Overrides the visible label for assistive technology; otherwise the label or placeholder names them. |
| inline | boolean \| undefined | no | false | Places the `label` as a LEADING cluster INSIDE the trigger row (a toolbar-style labeled select) instead of the persistent above/floating placement. Takes effect only alongside `label`. The inline label still names the trigger (accessibilityLabel / aria-labelledby) and shares its tap target, since it lives inside the trigger Pressable. Pairs with `fit` for a content-hugging toolbar cluster. |
| required | boolean \| undefined | no | false | Marks the field as required and announces "required" with the trigger name. A visible label also gets a decorative destructive "*". |
| icon | boolean \| undefined | no | false | Renders a leading globe glyph inside the trigger, indented so the value clears it. |
| placeholder | string \| undefined | no | "Select an option" | Prompt shown in the trigger when no value is selected. |
| open | boolean \| undefined | no | false | Controlled open state of the option list; omit for uncontrolled use. |
| defaultOpen | boolean \| undefined | no | false | Initial open state for uncontrolled use. |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes (trigger press, select), in both modes. |
| disabled | boolean \| undefined | no | false | Dims the control and blocks interaction. |
| onSelect | ((option: string) => void) \| undefined | no |  | Called with the chosen option's value when a row is pressed (both modes). |
| testID | string \| undefined | no |  | E2E hook forwarded to the trigger pressable. |
| dense | boolean \| undefined | no | false | Use the compact content-sized web field with a drawn disclosure chevron. |
| eyebrow | boolean \| undefined | no | false | Use the compact application eyebrow above a web field. |
| soft | boolean \| undefined | no | false | Use the brand field fill instead of the card fill. |
| plainOptions | boolean \| undefined | no | false | Text-only options: selected ink and a pointer wash, without a check gutter. |
| steadyPress | boolean \| undefined | no | false | Keep the resting fill and opacity during a press. |
| combobox | boolean \| undefined | no | false | Announce a selection field as a combobox rather than a menu button. |
| menuWidth | number \| undefined | no |  | Width of the floating menu, clamped within the overlay outlet. |
| small | boolean \| undefined | no | false | Size (pick one; default is the medium field, matching Input's h-9). |
| large | boolean \| undefined | no | false | Size (pick one; default is the medium field, matching Input's h-9). |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| ref | React.Ref<View> | no |  | Ref to the interactive trigger, preserving overlay measurement. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs. |
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

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
