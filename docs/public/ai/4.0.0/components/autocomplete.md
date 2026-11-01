# Autocomplete

Package: @nannier/canvas
Version: 4.0.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d245658f4bbe4b0d228e837d45b679ef7d0b430b11e0391463a008af7a4548de

Source: `src/atoms/autocomplete/autocomplete.md`
Human reference: https://canvas.nannier.com/components/autocomplete

## Public imports

```tsx
import { Autocomplete } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Text input + dropdown: searchable single-select.

Pass `label` (and `required`) to name the field:
iOS and web render the label
above the field, while Android floats the Material 3 in-container label once the
list opens or a value fills the field. On Android the field grows with the
user's text size, and a label longer than the field truncates on one line clear
of the toggle while the field's accessible name stays the whole label.
The required
star is decorative: a screen reader hears the field as required,
from
`aria-required` on the web and from its name ("Assigned to, required") on iOS and
Android.
The field fills the parent it is given; a
step of its own (`xs`, `lg`, …, with `start` to pin it to the leading edge) or a
Container step sets its measure.

On web the field is the Canvas v4 search field: 40px tall (32 small, 48 large) on
the sunken fill behind the `field-border` hairline, a leading 16px search glyph, a
400 14px value (13 small) and a 15px chevrons-up-down 10px from its end. The
pointer darkens the edge to the subtle ink, and focus rings it in the accent with a
4px halo. The suggestions are a card 6px under the field with a 4px inset and 34px
rows; the typed letters are marked in each suggestion on the accent's soft wash, and
the chosen suggestion sits on the `muted` wash.
iOS ships no combo box, so it draws
the same field and card at the iOS corners.
Android keeps the Material 3 exposed
dropdown: the filled field with its active indicator and drop-down triangle, and the
Material menu whose active and chosen rows take the state layer.

In glass mode the suggestion list is a dense-layer glass card under the field (or
above it when it fits there); the field, its caret and its toggle stay in place,
and picking a suggestion commits the value at once. Solid mode paints the skin's
own list.

Arrow Down and Arrow Up open the list and highlight an option while focus stays in the text field. Navigation stops at the first and last matches. Home and End jump to those limits once an option is highlighted; otherwise they retain their text-editing behavior. Enter chooses the highlighted option, Escape closes the list without changing the query, and Tab closes it while moving focus. Typing resets the highlight. Confirming an input-method candidate does not select an option or submit a surrounding Form.

Use `value` with `onValueChange` to control the selection, and use `""` for a controlled empty value. The callback reports selections and clearing the field. `onSelect` remains a selection-only notification. The independent `query`/`onQueryChange` pair controls filtering; choosing an option resets the query to `""`.

The disclosure button has a real target of at least 24px on web, 44pt on iOS, and 48dp on Android.
The small iOS field keeps a 44pt height so its touch target fits inside the field; its typography remains compact.

An option can carry a short `detail` (a version, a platform, a count): pass
`{ label, detail }` objects in place of strings, and the detail sits at the row's end
in the 11px mono face in the subtle ink.
Android sets it in the row's type and muted ink.
The label is what the query matches and what `value` holds; the row is announced as
"label, detail".

## Usage

```tsx
<Autocomplete label="Assigned to" placeholder="Search a person…" options={["Ada Lovelace", "Grace Hopper", "Kira Tanaka", "Liang Bao", "Noor Park"]} />
```

## Variants

### Required field

```tsx
<Autocomplete label="Assigned to" required placeholder="Search a person…" options={["Ada Lovelace", "Grace Hopper", "Kira Tanaka"]} />
```

### With helper text

```tsx
<Autocomplete label="Assigned to" helperText="The person responsible for this account." placeholder="Search a person…" options={["Ada Lovelace", "Grace Hopper", "Kira Tanaka"]} />
```

### Disabled

```tsx
<Autocomplete label="Assigned to" placeholder="Search a person…" disabled options={["Ada Lovelace", "Grace Hopper", "Kira Tanaka"]} />
```

### Option details

```tsx
<Autocomplete label="Runtime" placeholder="Search runtimes…" options={[{ label: "Expo", detail: "SDK 57" }, { label: "React Native", detail: "0.86" }, { label: "React Native Web", detail: "web" }, { label: "Remix", detail: "web" }]} />
```

### Controlled selection

```tsx
<Stateful initial="Grace Hopper">
  {(value, setValue) => (
    <Autocomplete label="Assigned to" options={["Ada Lovelace", "Grace Hopper", "Kira Tanaka"]} value={value} onValueChange={setValue} />
  )}
</Stateful>
```

### Measure

```tsx
<Column snug>
  <Autocomplete xs start options={["Ada Lovelace", "Grace Hopper"]} placeholder="xs step, pinned to the start (320)" />
  <Autocomplete lg start options={["Ada Lovelace", "Grace Hopper"]} placeholder="lg step, pinned to the start (512)" />
  <Container lg start><Autocomplete options={["Ada Lovelace", "Grace Hopper"]} placeholder="Bare, in an lg Container: fills it (512)" /></Container>
</Column>
```

## Do & Don't

### When to use

**Do** — A plain select for short, fixed lists; reserve the autocomplete for long, searchable ones.

```tsx
<Select label="Size" options={["Small", "Medium", "Large"]} placeholder="Select a size" />
```

**Don't** — Type or click: a search field for three fixed options is overhead with nothing to filter.

```tsx
<Autocomplete label="Size" options={["Small", "Medium", "Large"]} placeholder="Search…" />
```

### Filtering

**Do** — Type a few letters: the list narrows as you go, so a long list stays usable.

```tsx
<Autocomplete label="Assigned to" options={[
    "Wade Cooper",
    "Arlene Mccoy",
    "Devon Webb",
    "Tom Cook",
    "Tanya Fox",
    "Hellen Schmidt"
  ]} defaultQuery="co" />
```

**Don't** — Try typing: a plain dropdown wearing a search placeholder ignores every keystroke, so a long list stays as long as it started.

```tsx
<Select label="Assigned to" options={[
    "Wade Cooper",
    "Arlene Mccoy",
    "Devon Webb",
    "Tom Cook",
    "Tanya Fox",
    "Hellen Schmidt"
  ]} placeholder="Search a person…" />
```

### Selection

**Do** — Click an option: it fills the input and stays marked as selected.

```tsx
<Autocomplete label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook"]} defaultValue="Devon Webb" />
```

**Don't** — Click an option: the field is pinned to an empty `value`, so the list closes on nothing and you can't tell what you picked.

```tsx
<Autocomplete label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb", "Tom Cook"]} value="" placeholder="Pick a person…" />
```

### With label

**Do** — A persistent label keeps the field named after a selection has filled the input.

```tsx
<Autocomplete label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultValue="Devon Webb" />
```

**Don't** — Once a value replaces the placeholder, an unlabeled field has nothing left to name it.

```tsx
<Autocomplete options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultValue="Devon Webb" />
```

### With helper text

**Do** — A short placeholder plus persistent helper text keeps the rule visible while you type.

```tsx
<Autocomplete label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} placeholder="Search a person…" helperText="Deactivated users are hidden from the list." />
```

**Don't** — Type a letter: guidance crammed into the placeholder vanishes the moment you start.

```tsx
<Autocomplete label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} placeholder="Pick an active teammate; deactivated users are hidden" />
```

### Disabled

**Do** — Show the locked value and say why it's fixed, so disabled reads as a settled choice.

```tsx
<Autocomplete label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} defaultValue="Devon Webb" disabled helperText="Set by the project owner and can't be changed here." />
```

**Don't** — An empty, dimmed field with no value reads as broken, not as intentionally locked.

```tsx
<Autocomplete label="Assigned to" options={["Wade Cooper", "Arlene Mccoy", "Devon Webb"]} disabled placeholder="Search a person…" />
```

## Supported props

### AutocompleteProps

Includes `MeasureProps`; their supported fields are expanded below.

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| query | string \| undefined | no |  | The text typed into the field (controlled). Filters the option list. Omit and use `defaultQuery` for uncontrolled use: a bare Autocomplete is typeable out of the box. |
| defaultQuery | string \| undefined | no |  | Initial query for uncontrolled use. |
| onQueryChange | ((query: string) => void) \| undefined | no |  | Fired with the new query on each keystroke, and with "" when a select resets the filter (both modes). |
| options | (string \| AutocompleteOption)[] \| undefined | no |  | The full list of selectable options: bare labels, or `{ label, detail }` objects whose `detail` sits muted at the row's end (a version, a platform). The label is what the query matches and what `value` holds. |
| value | string \| undefined | no |  | The selected option label (CONTROLLED), or "" for no selection. Omit for uncontrolled use. |
| defaultValue | string \| undefined | no |  | Initial selected option for uncontrolled use (selecting a row updates it). |
| onValueChange | ((value: string) => void) \| undefined | no |  | Fired on selection and with "" when the field is cleared, in both controlled and uncontrolled modes. |
| placeholder | string \| undefined | no | "Search…" | Prompt shown in the field when there is no query or value. |
| open | boolean \| undefined | no | false | Whether the option list is open (CONTROLLED). Uncontrolled and closed by default; focusing or typing in the field opens it, the chevron toggles it. Pass `open` to pin it open, or `defaultOpen` to render it open initially while staying interactive. A disabled control stays closed regardless. |
| defaultOpen | boolean \| undefined | no | false | Render the list open initially for uncontrolled use (selecting or the chevron closes it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes (focus, typing, chevron, select). |
| label | string \| undefined | no |  | The field's persistent label. Its placement is platform-adaptive: iOS and web render it ABOVE the field; Android renders the Material 3 in-container FLOATING label (centered like a placeholder at rest, floating to the top once the list opens or a value fills the field). The label names the field for assistive tech. |
| required | boolean \| undefined | no | false | Marks the field as required: appends a destructive "*" to the label (decorative, never in the accessible name) and announces the field as required, through aria-required on the web and with the word in its name ("Assigned to, required") on iOS and Android. The star and the spoken word take effect only alongside `label`. |
| helperText | string \| undefined | no |  | Optional muted helper line rendered below the option list. |
| disabled | boolean \| undefined | no | false | Dims the control and blocks interaction. |
| onSelect | ((option: string) => void) \| undefined | no |  | Called when an option is chosen by touch, pointer, or keyboard. Clearing only fires onValueChange. |
| testID | string \| undefined | no |  | E2E hook forwarded to the text field. |
| small | boolean \| undefined | no | false | Size (pick one; default is the medium field, matching Input's h-9). |
| large | boolean \| undefined | no | false | Size (pick one; default is the medium field, matching Input's h-9). |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| ref | React.Ref<RNTextInput> | no |  | Ref to the underlying React Native host. Supports object refs and callback refs; native methods follow the platform's behavior. |
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

See [installation](https://canvas.nannier.com/ai/4.0.0/installation.md) for required peers and feature fallbacks.
