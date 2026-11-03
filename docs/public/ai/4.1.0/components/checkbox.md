# Checkbox

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 65a274e5daeaf87f9df07daf7e7604143f2e07a133bcae9c9c1bfed57b45e53e

Source: `src/atoms/checkbox/checkbox.md`
Human reference: https://canvas.nannier.com/components/checkbox

## Public imports

```tsx
import { Checkbox } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Multi-select option, single yes/no, grouped lists.

One job, a platform's own control: a Checkbox that is one setting (a yes/no, a consent, an opt-in)
renders the platform's switch on iOS and Android, where a single setting is a switch (Material 3 on phones included), and stays a checkbox on the web; its role follows what renders (`switch` there, `checkbox` here).
A Checkbox that selects items in a list, a table's rows or a "select all" parent takes `selection`:
the web keeps the checkbox, Android the Material 3 checkbox, and iOS draws the edit-mode selection circle.
`indeterminate` implies `selection`, since a mixed state belongs to a "select all" parent and a switch has none. In glass mode the box keeps its solid look on every platform: it is a small mark inside content, not a surface, so it draws with no pane and no rim, a checked box in its solid brand fill under its check and an empty box with its solid outline.

Pass `ref` to access the interactive checkbox row, including its label. Use `useRef<ComponentRef<typeof Checkbox>>(null)` from React, or `useRef<View>(null)` with React Native's `View` type. Object and callback refs are supported and detach on unmount. Calling `ref.current?.focus()` or `.blur()` delegates to the host without activating the control. Browser focus is supported; native focus depends on the platform and React Native version, and is separate from accessibility focus.

On the web, Space activates the focused control on key release, and Enter also activates it. Holding Space does not repeat the change. Moving focus away, disabling the control, or composing text cancels a pending Space press.

## Usage

```tsx
<Checkbox defaultChecked>Email notifications</Checkbox>
```

## Variants

### Unchecked

```tsx
<Checkbox>Email notifications</Checkbox>
```

### Disabled

```tsx
<Checkbox disabled>Email notifications</Checkbox>
```

### Sizes

```tsx
<Column>
  <Checkbox small defaultChecked>Small</Checkbox>
  <Checkbox defaultChecked>Default</Checkbox>
  <Checkbox large defaultChecked>Large</Checkbox>
</Column>
```

### With description

```tsx
<Checkbox defaultChecked description="Get notified when activity happens on your account.">
  Email notifications
</Checkbox>
```

### Nested group

A parent "select all" over a group of children: a list selection, so every box takes
`selection`. Wire the parent's `checked` and `indeterminate` from the children's
state: `checked` when every child is on, `indeterminate` when only some are, and
toggling the parent selects or clears the whole group. (`Stateful` is a docs-only
state holder so this fence can show the controlled wiring; in an app that state lives
in your own component.)

```tsx
<Stateful initial={["Read"]}>
  {(selected, setSelected) => {
    const perms = ["Read", "Write", "Delete"];
    const all = perms.every((p) => selected.includes(p));
    const some = selected.length > 0 && !all;
    return (
      <Column>
        <Checkbox
          selection
          checked={all}
          indeterminate={some}
          onChange={(next) => setSelected(next ? perms : [])}
        >
          Select all
        </Checkbox>
        <Column indent>
          {perms.map((p) => (
            <Checkbox
              key={p}
              selection
              checked={selected.includes(p)}
              onChange={(next) =>
                setSelected(next ? [...selected, p] : selected.filter((x) => x !== p))
              }
            >
              {p}
            </Checkbox>
          ))}
        </Column>
      </Column>
    );
  }}
</Stateful>
```

## Do & Don't

### Unchecked

**Do**: Leave opt-in consent unchecked so agreeing is a deliberate act the user takes.

```tsx
<Checkbox>Email me product news, offers, and survey invitations.</Checkbox>
```

**Don't**: A consent box that starts checked opts users in by default; under GDPR pre-ticked consent is not consent.

```tsx
<Checkbox defaultChecked>Email me product news, offers, and survey invitations.</Checkbox>
```

### Checked

**Do**: Show the parent indeterminate (a dash, not a tick) when only some children are checked.

```tsx
<Column snug>
  <Checkbox selection indeterminate>Select all</Checkbox>
  <Column snug indent>
    <Checkbox selection defaultChecked>Read</Checkbox>
    <Checkbox selection>Write</Checkbox>
    <Checkbox selection>Delete</Checkbox>
  </Column>
</Column>
```

**Don't**: A fully checked parent claims every child is selected when only one is, so the state reads as a lie.

```tsx
<View style={{ gap: 8 }}>
  <Checkbox selection defaultChecked>Select all</Checkbox>
  <View style={{ marginLeft: 24, gap: 8 }}>
    <Checkbox selection defaultChecked>Read</Checkbox>
    <Checkbox selection>Write</Checkbox>
    <Checkbox selection>Delete</Checkbox>
  </View>
</View>
```

### Disabled

**Do**: Say why it's unavailable, like a plan gate, or don't show it at all.

```tsx
<Checkbox disabled description="Available on the Pro plan">Export to CSV</Checkbox>
```

**Don't**: A disabled option with no reason leaves users stuck and guessing.

```tsx
<Checkbox disabled>Export to CSV</Checkbox>
```

### Selection

**Do**: Radios for one-of-many; reserve checkboxes for independent multi-select.

```tsx
<Column snug>
  <Typography small semibold>Plan</Typography>
  <RadioGroup defaultValue="pro">
    <Radio value="free">Free</Radio>
    <Radio value="pro">Pro</Radio>
    <Radio value="enterprise">Enterprise</Radio>
  </RadioGroup>
</Column>
```

**Don't**: Checkboxes allow multiple selections; for a one-of choice they let users pick contradictory options.

```tsx
<View style={{ gap: 8 }}>
  <Text style={{ marginBottom: 4, fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Plan</Text>
  <Checkbox>Free</Checkbox>
  <Checkbox defaultChecked>Pro</Checkbox>
  <Checkbox>Enterprise</Checkbox>
</View>
```

### With description

**Do**: Pass a `description` and the control stacks the title over its secondary line for you, box aligned to the first text line and the whole row tappable.

```tsx
<Checkbox defaultChecked description="Get notified when activity happens on your account.">
  Email notifications
</Checkbox>
```

**Don't**: A detached checkbox makes only the 18px box tappable; the label text does nothing.

```tsx
<View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
  <View style={{ marginTop: 2 }}>
    <Checkbox defaultChecked />
  </View>
  <View>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Email notifications</Text>
    <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Get notified when activity happens on your account.</Text>
  </View>
</View>
```

## Supported props

### CheckboxProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| children | ReactNode | no |  | Label text (the option's title) shown beside the box. |
| description | ReactNode | no |  | Optional muted secondary line rendered under the label, for the common title-plus-description option (a notification setting, a consent row). Supplying it builds the stacked title/description layout inside the control, so the caller never hand-composes a Row + Column + two Typography nodes and the whole row stays tappable. |
| checked | boolean \| undefined | no | false | Controlled checked state; omit for uncontrolled use. |
| defaultChecked | boolean \| undefined | no | false | Initial state for uncontrolled use (a bare <Checkbox /> is interactive). |
| indeterminate | boolean \| undefined | no | false | Mixed state: some-but-not-all selected. Shown as a dash, not a tick. Takes visual precedence over `checked`. Implies `selection`: a mixed state belongs to a list's select-all, and a switch has none. |
| selection | boolean \| undefined | no | false | A checkbox that selects an item in a list or a bulk selection (a table's rows, a list in edit mode, a select-all), rather than one on/off setting. The web draws the checkbox, iOS the edit-mode selection circle, Android the Material 3 checkbox. Without it a Checkbox is one setting, which iOS and Android render as their switch (role `switch`), so a settings row reads the way each platform writes it. |
| onChange | ((next: boolean) => void) \| undefined | no |  | Fired with the next checked value when the row is pressed (both modes). Web keyboard activation supports Space on release and Enter. |
| onValueChange | ((next: boolean) => void) \| undefined | no |  | Alias of onChange, for parity with RN's value-style callbacks. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for a LABEL-LESS checkbox (one with no `children`, e.g. a row selector in a table). With a visible label the label itself is the name; without one this is what a screen reader announces. |
| testID | string \| undefined | no |  | E2E hook forwarded to the pressable row. |
| small | boolean \| undefined | no | false | Size (pick one; default is the base box). |
| large | boolean \| undefined | no | false | Size (pick one; default is the base box). |
| disabled | boolean \| undefined | no | false | State. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |
| ref | React.Ref<View> | no |  | Ref to the interactive checkbox row, including its label. Typed as a React Native View. On web, React Native Web exposes its DOM host; focus() and blur() move browser focus. Native host behavior depends on the platform and React Native version. Calling focus() does not activate the control or call accessibility focus APIs. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
