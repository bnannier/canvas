# Popover

Floating panel for rich content triggered by a click.

## Usage

```tsx
<Popover
  trigger="Open popover"
  title="Popover"
  description="Place your rich content, form fields, or secondary actions here."
  actionLabel="Close"
/>
```

## Do & Don't

**Do** — Keep popovers compact: a focused prompt with one input and a clear action.

```tsx
<View className="rounded-md border border-border bg-popover p-4 shadow-md self-start min-w-[240px]">
  <Text className="mb-2 text-sm text-popover-foreground">Rename this project?</Text>
  <Input value="Identity Platform" className="mb-2" />
  <View className="flex-row justify-end gap-2">
    <Button outline small>Cancel</Button>
    <Button primary small>Rename</Button>
  </View>
</View>
```

**Don't** — A full form belongs in a dialog; in a floating popover it is cramped and easy to dismiss by accident.

```tsx
<View className="rounded-md border border-border bg-popover p-4 shadow-md self-start min-w-[260px]">
  <Field label="Name" placeholder="Ada Lovelace" className="mb-2" />
  <Field label="Email" placeholder="ada@canvas.dev" className="mb-2" />
  <View className="mb-2">
    <Text className="mb-1.5 text-sm font-medium text-foreground">Role</Text>
    <Select value="Engineer" options={["Engineer", "Designer", "Manager"]} />
  </View>
  <Field label="Team" placeholder="Identity Platform" className="mb-2" />
  <View className="flex-row justify-end gap-2">
    <Button outline small>Cancel</Button>
    <Button primary small>Save</Button>
  </View>
</View>
```

### Triggered

**Do** — Wrap the trigger in a relative anchor and dismiss on outside click so the panel positions and closes predictably.

```tsx
<Popover trigger="Open popover" open description="Anchored to the trigger, closes on outside click." actionLabel="Close" />
```

**Don't** — A trigger with no relative anchor and no way to dismiss leaves the panel floating loose and stuck open.

```tsx
<View className="self-start">
  <Button outline small>Open popover</Button>
  <View className="rounded-md border border-border bg-popover p-4 shadow-md mt-2 min-w-[240px]">
    <Text className="text-sm text-popover-foreground">No anchor, no dismiss, no Close.</Text>
  </View>
</View>
```

### Inline

**Do** — Reserve the static panel for a brief always-on message with a single follow-up action.

```tsx
<Popover inline description="Saved to drafts. Publish when ready." actionLabel="Publish" />
```

**Don't** — An always-visible panel that scrolls internally is doing a card's or section's job; use the panel chrome only for short content.

```tsx
<View className="rounded-md border border-border bg-popover p-4 shadow-md max-h-[120px] min-w-[260px] overflow-hidden">
  <ScrollView className="max-h-[88px]">
    <Field label="Street" placeholder="100 Market St" className="mb-2" />
    <Field label="City" placeholder="San Francisco" className="mb-2" />
    <Field label="Region" placeholder="California" className="mb-2" />
    <Field label="Postal code" placeholder="94105" className="mb-2" />
  </ScrollView>
</View>
```
