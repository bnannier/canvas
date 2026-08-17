# Button

Six variants × four sizes × disabled / focus / hover states. Always semantic: variant communicates intent (default = primary action, destructive = irreversible, ghost = chrome).

## Usage

A button's whole job is to fire `onPress`. Wire it to your own handler and every press runs it; here each press commits a save, and the line underneath reports the result. (`Stateful` is a docs-only helper that holds the example's state — in your app that state is your own.)

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button primary onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

## Variants

The variant only changes how a button looks; every one of them fires `onPress` the same way. Press any of them below.

### Outline

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button outline onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Secondary

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button secondary onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Ghost

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button ghost onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Destructive

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button destructive onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Link

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button link onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Small

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button primary small onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Large

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button primary large onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Icon only

```tsx
<Stateful initial={0}>
  {(added, setAdded) => (
    <Column snug alignCenter>
      <Button primary icon accessibilityLabel="Add item" iconLeft={<Icon plus primaryForeground size={16} />} onPress={() => setAdded(added + 1)} />
      <Typography muted>{added === 0 ? "Nothing added yet" : `Added ${added} ${added === 1 ? "item" : "items"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Disabled

A disabled button ignores presses: `onPress` is wired exactly as above, but it never runs, so the line underneath never moves.

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button primary disabled onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Nothing happens - the button is disabled" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

### Loading

```tsx
<Button primary loading>Saving</Button>
```

### Block

```tsx
<Button primary block>Create account</Button>
```

### With icon

```tsx
<Stateful initial={0}>
  {(saves, setSaves) => (
    <Column snug alignCenter>
      <Button primary iconLeft={<Icon plus primaryForeground size={16} />} onPress={() => setSaves(saves + 1)}>Save changes</Button>
      <Typography muted>{saves === 0 ? "Not saved yet" : `Saved ${saves} ${saves === 1 ? "time" : "times"}`}</Typography>
    </Column>
  )}
</Stateful>
```

## Do & Don't

### Default (primary)

**Do** — One clear primary action; everything else is supporting.

```tsx
<Row alignCenter snug>
  <Button primary>Save</Button>
  <Button outline>Cancel</Button>
</Row>
```

**Don't** — Multiple primaries compete; nothing stands out.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button primary>Save</Button>
  <Button primary>Apply</Button>
  <Button primary>Continue</Button>
</View>
```

### Outline

**Do** — Promote the main action to default; keep the rest outline.

```tsx
<Row alignCenter snug>
  <Button primary>Publish</Button>
  <Button outline>Save draft</Button>
  <Button outline>Schedule</Button>
</Row>
```

**Don't** — All-outline leaves no signal which action is primary.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
  <Button outline>Save</Button>
  <Button outline>Publish</Button>
  <Button outline>Schedule</Button>
</View>
```

### Secondary

**Do** — Default for the primary action; secondary for the next one down.

```tsx
<Row alignCenter snug>
  <Button primary>Create account</Button>
  <Button secondary>Import instead</Button>
</Row>
```

**Don't** — A secondary button as the main call to action under-sells it.

```tsx
<Button secondary>Create account</Button>
```

### Ghost

**Do** — Use ghost for tertiary and toolbar actions; keep the CTA filled.

```tsx
<Row alignCenter snug>
  <Button ghost>Cancel</Button>
  <Button primary>Save changes</Button>
</Row>
```

**Don't** — A ghost button is too quiet to carry the primary action.

```tsx
<Button ghost>Save changes</Button>
```

### Destructive

**Do** — Reserve the destructive variant for irreversible actions like delete.

```tsx
<Row alignCenter snug>
  <Button primary>Save changes</Button>
  <Button destructive>Delete account</Button>
</Row>
```

**Don't** — Red on a safe action cries wolf; users learn to ignore it.

```tsx
<Button destructive>Save changes</Button>
```

### Link

**Do** — Link variant for inline navigation; a filled button for the submit.

```tsx
<Row alignCenter cozy>
  <Button primary>Submit</Button>
  <Button link>Learn more</Button>
</Row>
```

**Don't** — A link-styled submit doesn't look pressable and gets lost.

```tsx
<Button link>Submit form</Button>
```
