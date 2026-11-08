# Popover

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: f07b9941fca03566f384a012745e4b377b2202f6f02f07a32a89796fc27a7ec3

Source: `src/atoms/popover/popover.md`
Human reference: https://canvas.nannier.com/components/popover

## Public imports

```tsx
import { Popover } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Floating panel with a title, supporting text, rich content such as form fields, and a single follow-up action, anchored to its trigger. Pass children to host custom content in the panel body, between the description and the action.

On the web and Android the panel is the v4 card:
280 wide at the menu corner, the field
hairline and the large shadow, a 15px display heading over its 14px description in the
muted ink, and in solid mode a small diamond beak on the edge facing its trigger.
iOS
keeps the iPad popover, a rounder borderless card with a tapered beak toward its
trigger.

The triggered card opens below its button by default and above it with `top`; either
way it flips to the other side when its own lacks room, and the beak follows the
side it took. At phone width a triggered card that can close is presented as a sheet
on the bottom edge of the window, over the tab bar and a dimming scrim that glass on the
web also blurs,
its content kept clear of the home indicator: Dark Factory's sheet on the web, the iOS sheet on iPhone and
the Material 3 bottom sheet on Android.

In glass mode the triggered card is a functional-layer glass panel beside its
button, and the sheet a dense-layer one, legible over its scrim; focus enters once the
card's placement has committed, and the `inline` card is a static in-flow panel. Solid
mode paints the skin's own panel.

An existing control can own the trigger: pass its `anchorRef` and drive `open`
with `onOpenChange`. The popover then adds no trigger or layout wrapper. Name
custom content with `accessibilityLabel`. `compact` uses the original Argus panel
inset and outside hairline on web, with scrolling contents; `comfortable` gives
its filter panel more room. `panelWidth` and `maxHeight` bound the overlay.
`anchored` keeps a floating card at narrow widths, and `alignEnd` follows the
trigger’s trailing edge.

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

### Compact panel

```tsx
<Popover compact comfortable anchored panelWidth={320} trigger="Filters" accessibilityLabel="Filters">
  <Typography small muted>Choose the roles and pods to include.</Typography>
</Popover>
```


### Inline

```tsx
<Popover inline title="Draft saved" description="Your changes are kept as a draft until you publish them." actionLabel="Publish" />
```

### Above

```tsx
<Popover top trigger="Filter" title="Filter results" description="Show only the projects you own." actionLabel="Apply" />
```

### Inline with a beak

An inline panel draws its beak when it is given a side: with `top` the panel sits above
what it belongs to and points down at it, with `bottom` below it and points up, and
`alignEnd` moves the beak to the panel's end, over a trigger that sits there.

```tsx
<Popover inline top alignEnd title="Share link" description="Anyone with the link can view." actionLabel="Copy link" />
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
<View style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, boxShadow: "0px 26px 50px -20px rgba(121, 100, 214, 0.22)", alignSelf: "flex-start", minWidth: 260 }}>
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
  <View style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, boxShadow: "0px 26px 50px -20px rgba(121, 100, 214, 0.22)", marginTop: 8, minWidth: 240 }}>
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
<View style={{ borderRadius: 12, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, padding: 16, boxShadow: "0px 26px 50px -20px rgba(121, 100, 214, 0.22)", maxHeight: 120, minWidth: 260, overflow: "hidden" }}>
  <ScrollView style={{ maxHeight: 88 }}>
    <Input label="Street" placeholder="100 Market St" style={{ marginBottom: 8 }} />
    <Input label="City" placeholder="San Francisco" style={{ marginBottom: 8 }} />
    <Input label="Region" placeholder="California" style={{ marginBottom: 8 }} />
    <Input label="Postal code" placeholder="94105" style={{ marginBottom: 8 }} />
  </ScrollView>
</View>
```

## Accessibility

The trigger is a button that announces its popup as a dialog and whether it is expanded. Opening the card moves keyboard focus into the panel, once its placement has settled: a dialog named by its title (by the trigger's label when it has none) and described by its supporting line. A card pinned open (a controlled `open` with no change handler) is part of the page and takes no focus as it appears.

With a keyboard, Tab moves through the panel's controls as if the card sat right after its trigger, then on to the control after the trigger, and the card stays open: the anchored popover is non-modal on the web. Shift+Tab from the panel returns to the trigger, and Tab from the trigger re-enters the card. Escape closes it, and focus goes back to whatever opened it.

The sheet on phones is modal, as it covers and dims the page: its dialog is announced as modal, Tab and Shift+Tab keep to its controls and wrap at their ends, and a Tab from anywhere on the page behind it goes into it. Escape, the action or a tap on the scrim closes it, and focus goes back to whatever opened it.

On iOS and Android the open card is modal to VoiceOver and TalkBack: the page behind it is hidden from them, their focus moves to the card's first line, and when the card closes it returns to the trigger. The escape gesture and the Android back button close the card.
Touch closes it with a tap anywhere outside it, and on phones a tap on the scrim above the sheet.

## Supported props

### PopoverProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| anchorRef | RefObject<View \| null> \| undefined | no |  | An existing trigger to anchor against; omits the built-in trigger and wrapper. |
| accessibilityLabel | string \| undefined | no |  | Explicit name for a panel with custom content. |
| compact | boolean \| undefined | no | false | Compact web application panel with an outside hairline and scrolling content. |
| comfortable | boolean \| undefined | no | false | Roomier compact-panel content inset. |
| anchored | boolean \| undefined | no | false | Keep the card anchored on narrow windows instead of adapting to a sheet. |
| alignEnd | boolean \| undefined | no | false | Align the trailing edge of the card to its trigger. |
| panelWidth | number \| undefined | no |  | Floating card width, clamped inside the overlay outlet. |
| maxHeight | number \| undefined | no |  | Maximum height of the floating card; its compact contents scroll within it. |
| trigger | string \| undefined | no |  | Label for the trigger button. |
| title | string \| undefined | no |  | Heading shown at the top of the floating card. |
| description | string \| undefined | no |  | Supporting line beneath the title. |
| children | ReactNode | no |  | Custom panel content (an input, a form row, any node), rendered in the card body between the description and the action row. Composes with the data-driven props. |
| actionLabel | string \| undefined | no |  | When set, renders a primary action button at the bottom of the card. |
| top | boolean \| undefined | no | false | Anchor the card ABOVE the trigger (it flips below when the room above is short). Placement axis: `top` > `bottom`. |
| bottom | boolean \| undefined | no | false | Anchor the card BELOW the trigger, the default (it flips above when the room below is short). |
| inline | boolean \| undefined | no | false | Static mode: render the card on its own with no trigger button (an always-visible inline panel). When set, the card is always shown and `open` is ignored. With `top` or `bottom` it points its beak at what it belongs to (below it with `top`, above it with `bottom`), from the end edge with `alignEnd`. |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (the trigger toggles it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
