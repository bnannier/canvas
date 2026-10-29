# Autocomplete

Text input + dropdown: searchable single-select.

Pass `label` (and `required`) to name the field:
<!-- only: web -->
iOS and web render the label
above the field, while Android floats the Material 3 in-container label once the
list opens or a value fills the field. On Android the field grows with the
user's text size, and a label longer than the field truncates on one line clear
of the toggle while the field's accessible name stays the whole label.
<!-- /only -->
<!-- only: ios -->
iOS renders the label above the field.
<!-- /only -->
<!-- only: android -->
Android floats the Material 3 in-container label once the list opens or a value fills the field. The field grows with the user's text size, and a label longer than the field truncates on one line clear of the toggle while the field's accessible name stays the whole label.
<!-- /only -->
The required
star is decorative: a screen reader hears the field as required,
<!-- only: web -->
from
`aria-required` on the web and from its name ("Assigned to, required") on iOS and
Android.
<!-- /only -->
<!-- only: ios android -->
from its name ("Assigned to, required").
<!-- /only -->
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
<!-- only: web ios -->
iOS ships no combo box, so it draws
the same field and card at the iOS corners.
<!-- /only -->
<!-- only: web android -->
Android keeps the Material 3 exposed
dropdown: the filled field with its active indicator and drop-down triangle, and the
Material menu whose active and chosen rows take the state layer.
<!-- /only -->

In glass mode the suggestion list is a dense-layer glass card under the field (or
above it when it fits there); the field, its caret and its toggle stay in place,
and picking a suggestion commits the value at once. Solid mode paints the skin's
own list.

Arrow Down and Arrow Up open the list and highlight an option while focus stays in the text field. Navigation stops at the first and last matches. Home and End jump to those limits once an option is highlighted; otherwise they retain their text-editing behavior. Enter chooses the highlighted option, Escape closes the list without changing the query, and Tab closes it while moving focus. Typing resets the highlight. Confirming an input-method candidate does not select an option or submit a surrounding Form.

Use `value` with `onValueChange` to control the selection, and use `""` for a controlled empty value. The callback reports selections and clearing the field. `onSelect` remains a selection-only notification. The independent `query`/`onQueryChange` pair controls filtering; choosing an option resets the query to `""`.

<!-- only: web -->
The disclosure button has a real target of at least 24px on web, 44pt on iOS, and 48dp on Android.
<!-- /only -->
<!-- only: ios -->
The disclosure button has a real target of at least 44pt.
<!-- /only -->
<!-- only: android -->
The disclosure button has a real target of at least 48dp.
<!-- /only -->
<!-- only: web ios -->
The small iOS field keeps a 44pt height so its touch target fits inside the field; its typography remains compact.
<!-- /only -->

An option can carry a short `detail` (a version, a platform, a count): pass
`{ label, detail }` objects in place of strings, and the detail sits at the row's end
in the 11px mono face in the subtle ink.
<!-- only: web android -->
Android sets it in the row's type and muted ink.
<!-- /only -->
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
