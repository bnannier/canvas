# Autocomplete

Text input + dropdown: searchable single-select. Pass `label` (and `required`) to name the field: iOS and web render the label above the field, while Android floats the Material 3 in-container label once the list opens or a value fills the field.

## Usage

```tsx
<Autocomplete
  options={[
    "Ada Lovelace",
    "Grace Hopper",
    "Kira Tanaka",
    "Liang Bao",
    "Marcus Allen",
    "Noor Park",
    "Rachel Chen"
  ]}
  label="Assigned to"
  placeholder="Search a person…"
/>
```

## Variants

### Required field

```tsx
<Autocomplete
  options={[
    "Ada Lovelace",
    "Grace Hopper",
    "Kira Tanaka",
    "Liang Bao",
    "Marcus Allen",
    "Noor Park",
    "Rachel Chen"
  ]}
  label="Assigned to"
  required
  placeholder="Search a person…"
/>
```

### With helper text

```tsx
<Autocomplete
  options={[
    "Ada Lovelace",
    "Grace Hopper",
    "Kira Tanaka",
    "Liang Bao",
    "Marcus Allen",
    "Noor Park",
    "Rachel Chen"
  ]}
  label="Assigned to"
  helperText="The person responsible for this account."
  placeholder="Search a person…"
/>
```

### Disabled

```tsx
<Autocomplete
  options={[
    "Ada Lovelace",
    "Grace Hopper",
    "Kira Tanaka",
    "Liang Bao",
    "Marcus Allen",
    "Noor Park",
    "Rachel Chen"
  ]}
  label="Assigned to"
  placeholder="Search a person…"
  disabled
/>
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
