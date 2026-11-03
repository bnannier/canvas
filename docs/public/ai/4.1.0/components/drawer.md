# Drawer

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: a6fbeb5731557d7d9a75c1ea15f26483ae43566809fb12c2a9add0ca4d3ff9e3

Source: `src/organisms/drawer/drawer.md`
Human reference: https://canvas.nannier.com/components/drawer

## Public imports

```tsx
import { Drawer } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

A full-screen panel that slides in from an edge: a navigation drawer, a mobile menu, or a bottom action sheet. Built on React Native's Modal,
so it floats over the whole app on iOS, Android, and the web,
over a dimmed scrim that glass on the web also blurs. For a small contextual menu, reach for Dropdown or RowMenu instead.

Drawer provides an overlay host inside its own window. Dropdown, Select, and other anchored children render above the panel without being clipped by its corners; no additional OverlayProvider is needed inside the drawer. A tap outside an open child menu dismisses that menu, and Escape dismisses the child before the drawer. Nested drawers each keep their overlays in their own window.

On iOS, VoiceOver's accessibility escape gesture requests dismissal of the
foremost open child before the drawer.
Android system back uses the same child
ownership.
A controlled child that stays open continues to own later requests;
one request never falls through to its parent. The scrim remains a pointer
target, and the built-in trigger opens the drawer. Sidebar drill-down navigation
has its own back behavior; accessibility escape dismisses the overlay rather
than navigating a sidebar level. Focus restoration remains platform-dependent.

Give a controlled drawer an `accessibilityLabel` when it has no built-in
`trigger`. A drawer with a trigger uses the trigger label as its modal name.

`header` and `footer` pin content around an independently scrolling body. Its
application inset is 20 pixels vertically and 24 horizontally, with 22 between
children. `navigation` gives that body no inset or gap and fills its height.
`plain` preserves the original square Argus side panel and lightly frosted dim on
web; native skins retain their platform panel. `instant` presents and dismisses
without a slide or fade. Existing drawers retain their animated default.

## Usage

```tsx
<Drawer trigger="Open menu">
  <Column padLoose cozy>
    <Typography lead semibold>Menu</Typography>
    <Button ghost block>Home</Button>
    <Button ghost block>Components</Button>
    <Button ghost block>Settings</Button>
  </Column>
</Drawer>
```

## Variants

### Application panel

```tsx
<Drawer plain instant right width={440} trigger="Agent details" header={<Typography h3 bold>Scout</Typography>} footer={<Button secondary>Pause</Button>}>
  <Typography>Recent work and trace details.</Typography>
</Drawer>
```


### Right

```tsx
<Drawer trigger="Right drawer" right>
  <Column padLoose snug>
    <Typography lead semibold>Details</Typography>
    <Typography small muted>A full-height panel on the right.</Typography>
  </Column>
</Drawer>
```

### Open in place

`embedded` draws the drawer open inside its parent (the panel at its edge over the parent's
own dim) for a specimen or a preview: it is a labelled region, not a modal, so it traps no
focus, takes no Escape or hardware back, and its dim passes touches through. It needs no
trigger and fills the parent it is given.

```tsx
<Drawer embedded open right accessibilityLabel="Invite people" header={<Typography h5>Invite people</Typography>}>
  <Input label="Email" placeholder="name@company.com" />
</Drawer>
```

### Bottom sheet

```tsx
<Drawer trigger="Bottom sheet" bottom>
  <Column padLoose snug>
    <Typography lead semibold>Actions</Typography>
    <Typography small muted>A sheet that rises from the bottom edge.</Typography>
  </Column>
</Drawer>
```

### Top sheet

```tsx
<Drawer trigger="Top sheet" top>
  <Column padLoose snug>
    <Typography lead semibold>What's new</Typography>
    <Typography small muted>A sheet that drops down from the top edge.</Typography>
  </Column>
</Drawer>
```

## Do & Don't

### Right tool for the job

**Do** — Use a Drawer for primary navigation or a full sheet of actions that should take over the screen on a phone.

```tsx
<Drawer trigger="Open navigation" left width={260}>
  <Column padLoose snug>
    <Typography lead semibold>Navigation</Typography>
    <Typography small muted>Home</Typography>
    <Typography small muted>Components</Typography>
  </Column>
</Drawer>
```

**Don't** — Use a full-screen Drawer for a small contextual menu; covering the whole screen for two choices is disorienting. Use a Dropdown or RowMenu anchored to the trigger.

```tsx
<Drawer trigger="Edit" right width={240}>
  <View style={{ padding: 20, gap: 10 }}>
    <Text style={{ fontSize: 14, color: tokens.foreground }}>Rename</Text>
    <Text style={{ fontSize: 14, color: tokens.foreground }}>Delete</Text>
  </View>
</Drawer>
```

## Supported props

### DrawerProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| header | ReactNode | no |  | Pinned header above the independently scrolling body. |
| footer | ReactNode | no |  | Pinned actions below the independently scrolling body. |
| navigation | boolean \| undefined | no | false | Navigation body: no content inset or inter-item gap; fills the available height. |
| plain | boolean \| undefined | no | false | Square web side panel and the original lightly frosted application dim. |
| instant | boolean \| undefined | no | false | Present and dismiss immediately, preserving the original application interaction. |
| embedded | boolean \| undefined | no | false | Show the open drawer as a non-modal specimen inside its parent, for a catalogue or a showcase: the panel docks against its edge of the parent (which gives it its height) over the dim, with no Modal, no slide, no focus trap, and no close on Escape, native back or a tap on the dim. It keeps its labelling as a named region. Ignored with `trigger`, which always opens a live drawer. |
| children | ReactNode | no |  | Panel content. |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (a `trigger` opens it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes (trigger press, scrim tap, back/escape). |
| trigger | string \| undefined | no |  | Label for an optional outline trigger button. When set, the drawer renders the button and opens itself on press (uncontrolled). Omit when you drive `open` yourself. |
| left | boolean \| undefined | no | false | A full-height panel on the left edge (default). |
| right | boolean \| undefined | no | false | A full-height panel on the right edge. |
| bottom | boolean \| undefined | no | false | A sheet spanning the width, rising from the bottom. |
| top | boolean \| undefined | no | false | A sheet spanning the width, dropping from the top. |
| width | number \| undefined | no | 300 | Width of a side drawer in px (default 300). Ignored for the bottom/top sheet. |
| accessibilityLabel | string \| undefined | no |  | Accessible name for the modal surface. Required when the drawer has no trigger whose label can name it. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition for the panel surface, never a restyle hook. (Device safe-area insets are applied automatically.) |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
