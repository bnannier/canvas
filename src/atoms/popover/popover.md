# Popover

Floating panel with a title, supporting text, rich content such as form fields, and a single follow-up action, anchored to its trigger. Pass children to host custom content in the panel body, between the description and the action.

On the web and Android the panel is Dark Factory's: a 12px card with a hairline and
its soft popover shadow, Dark Factory's heading over its body in the muted ink. iOS
keeps the iPad popover, a rounder borderless card with a beak toward its trigger, in
the same type.

The triggered card opens below its button by default and above it with `top`; either
way it flips to the other side when its own lacks room, and the iOS beak follows the
side it took. At phone width a triggered card that can close is presented as a sheet
on the bottom edge of the window, over the tab bar and a dimming scrim, its content kept
clear of the home indicator: Dark Factory's sheet on the web, the iOS sheet on iPhone and
the Material 3 bottom sheet on Android.

In glass mode the triggered card is a functional-layer glass panel beside its
button; focus enters once the card's placement has committed, and the `inline`
card is a static in-flow panel. Solid mode paints the skin's own panel.

## Usage

```tsx
<Popover
  trigger="Open popover"
  title="Rename project"
  description="Choose a name your team will recognize."
  actionLabel="Rename"
>
  <Input label="Project name" defaultValue="Identity Platform" />
</Popover>
```

## Variants

### Inline

```tsx
<Popover inline title="Draft saved" description="Your changes are kept as a draft until you publish them." actionLabel="Publish" />
```

### Above

```tsx
<Popover top trigger="Filter" title="Filter results" description="Show only the projects you own." actionLabel="Apply" />
```

### Description only

```tsx
<Popover trigger="What is a workspace?" description="A workspace groups your projects, members, and billing under one plan." />
```

### Controlled

```tsx
<Stateful initial={false}>
  {(open, setOpen) => (
    <Column snug>
      <Typography small muted>{open ? "The share popover is open." : "The share popover is closed."}</Typography>
      <Popover
        trigger="Share"
        open={open}
        onOpenChange={setOpen}
        title="Share this project"
        description="Anyone with the link can view it."
        actionLabel="Copy link"
      />
    </Column>
  )}
</Stateful>
```

## Do & Don't

### Compact content

**Do** — Keep popovers compact: a focused prompt with one input and a clear action.

```tsx
<Popover inline title="Rename this project?" actionLabel="Rename">
  <Input label="Project name" defaultValue="Identity Platform" />
</Popover>
```

**Don't** — A full form belongs in a dialog; in a floating popover it is cramped and easy to dismiss by accident.

```tsx
<View style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, ...shadow("lg"), alignSelf: "flex-start", minWidth: 260 }}>
  <Input label="Name" placeholder="Ada Lovelace" style={{ marginBottom: 8 }} />
  <Input label="Email" placeholder="ada@canvas.dev" style={{ marginBottom: 8 }} />
  <View style={{ marginBottom: 8 }}>
    <Text style={{ marginBottom: 6, fontSize: 12, lineHeight: 17, fontWeight: "600", color: tokens.foreground }}>Role</Text>
    <Select defaultValue="Engineer" options={["Engineer", "Designer", "Manager"]} />
  </View>
  <Input label="Team" placeholder="Identity Platform" style={{ marginBottom: 8 }} />
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
  <View style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, ...shadow("lg"), marginTop: 8, minWidth: 240 }}>
    <Text style={{ fontSize: 12.5, lineHeight: 19, fontWeight: "500", color: tokens["popover-foreground"] }}>No anchor, no dismiss, no Close.</Text>
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
<View style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, ...shadow("lg"), maxHeight: 120, minWidth: 260, overflow: "hidden" }}>
  <ScrollView style={{ maxHeight: 88 }}>
    <Input label="Street" placeholder="100 Market St" style={{ marginBottom: 8 }} />
    <Input label="City" placeholder="San Francisco" style={{ marginBottom: 8 }} />
    <Input label="Region" placeholder="California" style={{ marginBottom: 8 }} />
    <Input label="Postal code" placeholder="94105" style={{ marginBottom: 8 }} />
  </ScrollView>
</View>
```

## Accessibility

The trigger is a button that announces its popup as a dialog and whether it is expanded. Opening the card moves keyboard focus into the panel, once its placement has settled: a dialog named by its title (by the trigger's label when it has none) and described by its supporting line.

With a keyboard, Tab moves through the panel's controls as if the card sat right after its trigger, then on to the control after the trigger, and the card stays open: the popover is non-modal on the web. Shift+Tab from the panel returns to the trigger, and Tab from the trigger re-enters the card. Escape closes it, and focus goes back to whatever opened it.

On iOS and Android the open card is modal to VoiceOver and TalkBack: the page behind it is hidden from them, their focus moves to the card's first line, and when the card closes it returns to the trigger. The escape gesture and the Android back button close the card. Touch closes it with a tap anywhere outside it, and on phones a tap on the scrim above the sheet.
