# Popover

Floating panel with a title, supporting text, and a single follow-up action, anchored to its trigger.

## Usage

```tsx
<Popover
  trigger="Open popover"
  title="Popover"
  description="A short prompt with supporting text and one follow-up action."
  actionLabel="Close"
/>
```

## Do & Don't

**Do** — Keep popovers compact: a focused prompt with one input and a clear action.

```tsx
<Card padded style={{ minWidth: 240 }}>
  <Column snug>
    <Typography small>Rename this project?</Typography>
    <Input value="Identity Platform" />
    <Row snug end>
      <Button outline small>Cancel</Button>
      <Button primary small>Rename</Button>
    </Row>
  </Column>
</Card>
```

**Don't** — A full form belongs in a dialog; in a floating popover it is cramped and easy to dismiss by accident.

```tsx
<View style={{ borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, ...shadow("md"), alignSelf: "flex-start", minWidth: 260 }}>
  <Field label="Name" placeholder="Ada Lovelace" style={{ marginBottom: 8 }} />
  <Field label="Email" placeholder="ada@canvas.dev" style={{ marginBottom: 8 }} />
  <View style={{ marginBottom: 8 }}>
    <Text style={{ marginBottom: 6, fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Role</Text>
    <Select defaultValue="Engineer" options={["Engineer", "Designer", "Manager"]} />
  </View>
  <Field label="Team" placeholder="Identity Platform" style={{ marginBottom: 8 }} />
  <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 8 }}>
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
<View style={{ alignSelf: "flex-start" }}>
  <Button outline small>Open popover</Button>
  <View style={{ borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, ...shadow("md"), marginTop: 8, minWidth: 240 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["popover-foreground"] }}>No anchor, no dismiss, no Close.</Text>
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
<View style={{ borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, ...shadow("md"), maxHeight: 120, minWidth: 260, overflow: "hidden" }}>
  <ScrollView style={{ maxHeight: 88 }}>
    <Field label="Street" placeholder="100 Market St" style={{ marginBottom: 8 }} />
    <Field label="City" placeholder="San Francisco" style={{ marginBottom: 8 }} />
    <Field label="Region" placeholder="California" style={{ marginBottom: 8 }} />
    <Field label="Postal code" placeholder="94105" style={{ marginBottom: 8 }} />
  </ScrollView>
</View>
```
