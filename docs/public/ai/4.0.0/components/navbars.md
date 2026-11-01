# Navbar

Package: @nannier/canvas
Version: 4.0.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d245658f4bbe4b0d228e837d45b679ef7d0b430b11e0391463a008af7a4548de

Source: `src/organisms/navbars/navbars.md`
Human reference: https://canvas.nannier.com/components/navbars

## Public imports

```tsx
import { Navbar } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Topbars with a brand, navigation links, and an action button. Used as the
primary app-level navigation.

The bar measures its own width: at and below the `sm` breakpoint (640) the links
row automatically collapses into a menu button opening a dropdown of the same
links (the active one checkmarked), so links never clip off a phone screen;
`active` and `onSelect` keep their contract in both renderings.
The menu button
leads the bar, ahead of the logo and brand, where Material 3's top app bar puts
its navigation icon.
Pass `scrolls` to keep every link at every width instead: the bar's content row
then pans sideways inside the bar, with no scroll indicator, and the links never
fold into the menu. `onMenu` still replaces the links when both are passed.

On the web the bar is the v4 hand-off's: 56px tall with a 16px gutter, 32px
capsule links in the interface face, the active one (and a hovered one) on the
`secondary` fill. `floating` lifts it as a pill on the stronger hairline with the
md shade.
On iOS and Android the bar keeps the platform's own navigation bar and
top app bar shape.

In glass mode the active link paints a control-layer pane
(iOS keeps its
inactive capsules and carries the brand fill as glass, web and Android carry
their tinted tile),
and the collapsed menu is Dropdown's dense-layer glass card
under the hamburger. Solid mode keeps the skin's own active tile.

Either cluster takes a caller-supplied element beside its built-in parts:
`brandContent` leads the left one with a logo mark (beside or instead of the
`brand` wordmark) and `actions` leads the right one with free-form trailing
controls (a search button, icon buttons), ahead of `actionLabel` and `avatar`.
`links` is optional, so a console topbar with no middle nav renders neither the
links row nor the menu button that stands in for it.

## Usage

```tsx
<Navbar
  brand="Canvas"
  links={["Dashboard", "Users", "Settings"]}
  actionLabel="New"
  avatar="RC"
/>
```

## Variants

### Bordered

```tsx
<Navbar bordered brand="Canvas" links={["Dashboard", "Users", "Settings"]} />
```

### Floating

```tsx
<Navbar floating brand="Canvas" links={["Dashboard", "Users", "Settings"]} />
```

### Compact

`compact` is the density axis's one member: the tight bar, 44px with a 5px inset
and 2px between every item on the web (a shorter bar with tighter gaps natively).

```tsx
<Navbar compact floating brand="Canvas" links={["Docs", "Components", "Templates"]} />
```

### Scrolls

With `scrolls` the links never fold into the narrow menu: the content row scrolls
sideways inside the bar once it no longer fits. With `floating` and `compact` it is
the hand-off's docs pill.

```tsx
<Navbar scrolls floating compact brand="Canvas" links={["Foundations", "Controls", "Inputs", "Navigation", "Overlays", "Data", "Charts", "Layout", "Templates"]} />
```

### Brand divider

`brandDivider` sets the brand apart from the links with a short vertical rule (the kit
`Divider vertical inset strong`), as the hand-off's floating docs pill does. It shows
only while the links row is on the bar.

```tsx
<Navbar brandDivider scrolls floating compact brand="Canvas" links={["Foundations", "Controls", "Inputs", "Navigation"]} />
```

### Links with destinations

`hrefs` gives the links their destinations, by index. On the web each becomes a real
anchor, so middle-click and open-in-new-tab work, while a plain click still selects
the link and calls `onSelect` with the press event (call `event.preventDefault()`
there to route on the client). A modifier or middle click is left to the browser.
Natively `hrefs` is ignored and `onSelect` does the navigating.

```tsx
<Navbar bordered brand="Canvas" links={["Docs", "Components", "Templates"]} hrefs={["/docs", "/components", "/templates"]} />
```

### Bare

A bare bar paints no surface and no hairline, so it sits clear on what is behind it.
Pass it at the scroll edge, while nothing has scrolled under the bar, and drop it once
content does: the bar's own surface then returns to keep its labels legible,
as iOS's
navigation bar and Material 3's top app bar do.
A framed bar (`bordered`, `floating`)
keeps its frame over `bare`.

```tsx
<Navbar bare brand="Canvas" links={["Dashboard", "Users", "Settings"]} />
```

### App menu

An app with more destinations than a bar can hold (a component catalog, a settings
tree) passes `onMenu`: the bar leads with a menu button at every width and the app
opens its own navigation, such as a Drawer of grouped sections. It replaces `links`.

```tsx
<Stateful initial={false}>
  {(open, setOpen) => (
    <View>
      <Navbar bordered brand="Catalog" onMenu={() => setOpen(true)} />
      <Drawer open={open} onOpenChange={setOpen} accessibilityLabel="Catalog menu">
        <Column padLoose loose>
          <Typography h3>Components</Typography>
          <Button ghost onPress={() => setOpen(false)}>Button</Button>
          <Button ghost onPress={() => setOpen(false)}>Card</Button>
        </Column>
      </Drawer>
    </View>
  )}
</Stateful>
```

### Console topbar

```tsx
<Navbar
  brandContent={<Icon layers />}
  actions={<Button ghost small icon accessibilityLabel="Search" iconLeft={<Icon search size={16} />} />}
  avatar="RC"
/>
```

## Do & Don't

### Brand element

**Do**: Pass the mark through `brandContent`, so the bar owns the whole brand group and the wordmark keeps its own type.

```tsx
<Navbar bordered brandContent={<Icon layers size={20} />} brand="Console" links={["Overview", "Access", "Audit"]} avatar="RC" />
```

**Don't**: Folding the mark into the wordmark string leaves it as text, stuck in the title's size and color.

```tsx
<Navbar bordered brand="◆ Console" links={["Overview", "Access", "Audit"]} avatar="RC" />
```

### Standard topbar

**Do** — Keep a few primary links inline and fold the rest behind a More menu.

```tsx
<Navbar bordered brand="Canvas" defaultActive={0} links={["Dashboard", "Users", "Settings"]} actionLabel="New" avatar="RC" />
```

**Don't** — Cramming every destination into the bar wraps the row and buries the primary links.

```tsx
<Navbar bordered brand="Canvas" defaultActive={0} links={[
    "Dashboard",
    "Users",
    "Settings",
    "Billing",
    "Reports",
    "Integrations",
    "Audit",
    "Webhooks"
  ]} avatar="RC" />
```

### With search bar

**Do** — Use a button that opens the command palette and advertise the ⌘K shortcut.

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <Row alignCenter snug pad style={{ height: 56 }}>
    <Typography small semibold>Canvas</Typography>
    <Container sm start>
      <Button outline block iconLeft={<Icon search muted size={13} />} iconRight={<Kbd>⌘K</Kbd>}>Search…</Button>
    </Container>
  </Row>
</Card>
```

**Don't** — A live text field in the bar reads as a form input and offers no keyboard affordance.

```tsx
<View style={{ width: "100%", overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", height: 56, alignItems: "center", gap: 8, backgroundColor: tokens.card, paddingHorizontal: 16 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Canvas</Text>
    <View style={{ marginHorizontal: 16, maxWidth: 400, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
      <TextInput placeholder="Search…" style={{ height: 36, width: "100%", borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.background, paddingHorizontal: 12, paddingVertical: 4, fontSize: 14, lineHeight: 20, color: tokens.foreground }} />
    </View>
  </View>
</View>
```

### Mobile

**Do** — Collapse the links into a hamburger and keep only the logo and avatar in the bar.

```tsx
<Card flat flush style={{ overflow: "hidden" }}>
  <Row alignCenter snug pad style={{ height: 56 }}>
    <Button ghost iconLeft={<Icon menu muted size={18} />} accessibilityLabel="Open menu" />
    <Typography small semibold>Canvas</Typography>
    <Column grow />
    <Avatar small src="/rachel-chen.jpg" name="RC" />
  </Row>
</Card>
```

**Don't** — A full horizontal nav at phone width wraps onto a second row and crowds out the logo.

```tsx
<View style={{ width: "100%", maxWidth: 360, overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", height: 56, alignItems: "center", gap: 4, backgroundColor: tokens.card, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Canvas</Text>
    <View style={{ marginLeft: 8, flexDirection: "row", flexWrap: "wrap", gap: 4 }}>
      <Pressable style={({ pressed }) => [{ borderRadius: 6, backgroundColor: tokens.accent, paddingHorizontal: 12, paddingVertical: 6 }, pressed ? { opacity: 0.9 } : null]}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Dashboard</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [{ borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }, pressed ? { opacity: 0.9 } : null]}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["muted-foreground"] }}>Users</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [{ borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }, pressed ? { opacity: 0.9 } : null]}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["muted-foreground"] }}>Settings</Text>
      </Pressable>
      <Pressable style={({ pressed }) => [{ borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 }, pressed ? { opacity: 0.9 } : null]}>
        <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["muted-foreground"] }}>Billing</Text>
      </Pressable>
    </View>
  </View>
</View>
```

## Supported props

### NavbarProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| brand | string \| undefined | no |  | Brand or product name shown at the left, in a semibold face. |
| brandContent | ReactNode | no |  | A brand ELEMENT for the left cluster (a logo mark, a workspace switcher). It LEADS the cluster, so passing it beside `brand` renders the mark first and keeps the wordmark beside it; passing it alone makes the mark the whole brand. It takes the left cluster's own gap, so it needs no wrapper. |
| brandHref | string \| undefined | no |  | Where the brand leads (an app's home, `/`). With it, or with `onBrandPress`, the brand lockup is one link: a real anchor on the web (an `<a href>`, so middle-click and modifier-click open it in a new tab), named by `brand`, with the kit's focus ring. |
| onBrandPress | ((event: GestureResponderEvent) => void) \| undefined | no |  | Called when the brand is pressed; on the web a modifier-click on a `brandHref` stays the browser's. |
| brandDivider | boolean \| undefined | no | false | Draw a short vertical separator between the brand and the links (the kit `<Divider vertical inset strong />`), as the hand-off's floating docs pill does. It shows only while both the brand and the links row are on the bar, so a collapsed bar or one without links never ends its brand on a stray rule. |
| links | string[] \| undefined | no |  | Ordered navigation link labels rendered in the middle row. Omit it (or pass an empty array) for a bar with no middle nav: neither the links row nor the narrow menu button that stands in for it renders. |
| hrefs | string[] \| undefined | no |  | Destinations for `links`, by index (parallel to it). A link with an href renders as a real anchor on the web (an `<a href>`, so middle-click, modifier-click and open-in-new-tab work); natively it is ignored. A plain click still selects the link and calls `onSelect` with the press event, so an app that routes on the client calls `event.preventDefault()` there; a modifier or middle click is left to the browser and selects nothing. Omit it (or an entry) for a link without a destination. |
| active | number \| undefined | no |  | Index of the active link (CONTROLLED; its label reads in the foreground color). Omit for uncontrolled use. |
| defaultActive | number \| undefined | no |  | Initial active link for uncontrolled use (a bare navbar moves the active link on press). |
| actions | ReactNode | no |  | Free-form trailing controls for the right cluster: a ghost search button, icon buttons, a notification dropdown, an account menu. They LEAD the cluster, ahead of the built-in `actionLabel` button and `avatar`, and take the cluster's own gap, so they need no wrapper. Keep them few and compact: the bar is a fixed height and the slot is rendered as given at every width. |
| actionLabel | string \| undefined | no |  | Optional primary action; renders a <Button primary small> on the right. |
| onAction | (() => void) \| undefined | no |  | Called when the action button is pressed. |
| avatar | string \| undefined | no |  | Optional account initials/name; renders an <Avatar small> on the right. |
| onSelect | ((index: number, event?: GestureResponderEvent) => void) \| undefined | no |  | Called when a nav link is pressed, with its index, and the press event when it came from the link itself (not from the narrow menu). |
| onMenu | (() => void) \| undefined | no |  | The app's own navigation menu. When set, the bar leads with a menu button at every width and calls this on press, so the app can open navigation of its own (a Drawer of grouped sections). It replaces the `links` row and its narrow menu: pass one or the other. |
| bordered | boolean \| undefined | no | false | Surface (pick one; default is the flush bottom-hairline bar). |
| floating | boolean \| undefined | no | false | Surface (pick one; default is the flush bottom-hairline bar). |
| bare | boolean \| undefined | no | false | No surface and no hairline: the bar sits clear on what is behind it. Pass it while nothing has scrolled under the bar (the scroll edge) and drop it once content does. |
| compact | boolean \| undefined | no | false | The tight bar: 44px with a 5px inset and 2px between items on the web (the docs pill). |
| scrolls | boolean \| undefined | no | false | Keep every link at every width: the bar's content row scrolls sideways inside the bar (no scroll indicator) instead of folding the links into the narrow menu button. Pair it with `floating` and `compact` for the hand-off's docs pill. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.0.0/installation.md) for required peers and feature fallbacks.
