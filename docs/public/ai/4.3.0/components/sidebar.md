# Sidebar

Package: @nannier/canvas
Version: 4.3.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 10e4f5218789eb98502e14bf201af786b4dfc5252b2e04bd9a8ba05818c58bc8

Source: `src/organisms/sidebar/sidebar.md`
Human reference: https://canvas.nannier.com/components/sidebar

## Public imports

```tsx
import { Sidebar } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

App navigation rail with collapsible sections and active highlighting. The sidebar on the left of this page is a thin adapter over this very `Sidebar` component: it feeds the docs' nav tree in and gets the same collapse, accordion, and active-highlight behavior back.

In glass mode the active row paints a control-layer pane behind its icon, label
and badge; the drill-down drawer keeps its own row treatment. Solid mode keeps
the skin's own row fill.

On the web a hovered row's wash (the palette's translucent `hover`) fades in over
150 ms and back out when the pointer leaves, in the rail and the drill-down alike;
the pressed and active fills still switch at once, and Reduce Motion makes the wash
instant.

Add `responsive` to make it adapt across breakpoints: it stays the accordion rail on desktop, and at and below the `lg` breakpoint (1024px) it becomes a start-edge (left, RTL-aware) **navigation drawer** that drills through the same `sections` one level at a time (tap a group to slide in to its rows, back to return). Drive the drawer's open state with `open` / `onOpenChange` from your own hamburger button; the `header` and `footer` slots pin above and below the drill-down, just as in the rail. The drawer slides from the start (left) edge by default; `drawerRight`, `drawerTop`, and `drawerBottom` change which edge it slides in from. (This page's own left nav does exactly this: an accordion rail here, a drill-down drawer on a phone.)

Pass `drawer` instead when the shell's hamburger is the only way into the tree at every width (a top app bar on a phone and a tablet alike): the sidebar is then the drill-down drawer at every width and never the inline rail, with the same `open` / `onOpenChange` wiring. `drawer` wins over `responsive`.

On the web the sidebar takes the Canvas v4 rail: a 232px column on the sunken page
tone, rows 36px tall at a 9px corner (30px at 8 with `compact`, the docs rail's
density), 500 13px labels in the secondary ink, the active row on the accent's soft
wash in the accent's text ink, and a mono uppercase eyebrow over each titled group.
iOS and Android keep their platform rows (the HIG capsule, the Material 3 pill) in the
v4 colors.

`markers` gives each row a trailing dot: the accent on the active row, and the field
hairline on a row of the reader's current place, either one item with `marked: true`
or every row of a section with `current: true`. A `current` section also sets its
eyebrow in the accent's text ink and its resting rows in the foreground ink, and a
section's `count` sits at the far end of its heading.

`embedded` renders the navigation groups inside an app-owned rail: it inherits the
rail's frame, fill, width and scroll, stacks its groups 16px apart, and renders the
`header` and `footer` slots as plain blocks above and below them, so a filter field or
a heading row fits there. A framed sidebar's header grows past its 56px floor when its
content is taller.

A sidebar is a navigation landmark on every platform. Name it with `accessibilityLabel`,
a short statement of what it navigates such as "Workspace", so a screen reader's
landmark list can tell it apart; a page that holds more than one navigation landmark (a
sidebar beside the app's top navigation, or two sidebars) needs a distinct name on each.
In the narrow `responsive` drawer the same name labels the drawer.

## Usage

The one `Sidebar` below is the whole story: on desktop it is the collapsible accordion rail (tap the header chevron to shrink it to icons); narrow the window to a phone and the same component
becomes a start-edge drill-down **Liquid Glass menu** opened by the top bar's hamburger,
exactly like this page's own left nav. `AppShell` is the docs' live app frame (the top bar and placeholder page); the `Sidebar` wiring is the part you copy.

```tsx
<AppShell>
  {({ open, setOpen }) => (
    <Sidebar
      responsive
      collapsible
      defaultActive="Dashboard"
      open={open}
      onOpenChange={setOpen}
      header={(collapsed) => (collapsed ? <Icon layoutGrid primary size={22} /> : <Typography body semibold>Acme</Typography>)}
      sections={[
        { items: [
          { label: "Dashboard", icon: "layoutGrid" },
          { label: "Inbox", icon: "inbox", badge: "3" }
        ] },
        { title: "Reports", icon: "barChart2", collapsible: true, items: [
          { label: "Analytics", icon: "barChart2" },
          { label: "Traffic", icon: "activity" }
        ] }
      ]}
    />
  )}
</AppShell>
```

## Variants

### Collapsed rail

```tsx
<Sidebar
  bordered
  collapsed
  defaultActive="Dashboard"
  items={[
    { label: "Dashboard", icon: "layoutGrid" },
    { label: "Inbox", icon: "inbox" },
    { label: "Settings", icon: "settings" }
  ]}
/>
```

### Error badge

```tsx
<Sidebar
  bordered
  defaultActive="Dashboard"
  items={[
    { label: "Dashboard", icon: "layoutGrid" },
    { label: "Members", icon: "users" },
    { label: "Security", icon: "shield", badge: "3", badgeError: true }
  ]}
/>
```

### Accent tag and account

`badgeAccent` draws a row's `badge` as the accent's solid tag (18 px, a 10 px label) for
something new rather than a count; a row's `meta` is quiet mono text in the third ink.
`account` pins a filled account card to the foot of the column: a small avatar beside the
name and a detail line in the third ink (the collapsed rail keeps the avatar).

```tsx
<Sidebar
  defaultActive="overview"
  sections={[
    {
      title: "Workspace",
      items: [
        { id: "overview", label: "Overview", icon: "layoutDashboard" },
        { id: "members", label: "Members", icon: "users", meta: "24" },
        { id: "tokens", label: "Tokens", icon: "palette", badge: "New", badgeAccent: true }
      ]
    }
  ]}
  account={{ name: "Northwind", detail: "24 members", src: "/grace-hopper.jpg" }}
/>
```

### Markers and the current place

```tsx
<Sidebar
  bordered
  compact
  markers
  defaultActive="button"
  sections={[
    { title: "Controls", count: 3, current: true, items: [
      { id: "button", label: "Button" },
      { id: "switch", label: "Switch" },
      { id: "checkbox", label: "Checkbox" }
    ] },
    { title: "Inputs", count: 2, items: [
      { id: "input", label: "Input" },
      { id: "select", label: "Select", marked: true }
    ] }
  ]}
/>
```

### Embedded rail with a filter

```tsx
<Container xxxs start>
  <Sidebar
    embedded
    compact
    markers
    defaultActive="button"
    accessibilityLabel="Controls components"
    header={<Input small leadingIcon icon="search" placeholder="Filter 3 components" accessibilityLabel="Filter components" />}
    sections={[
      { title: "Controls", count: 3, items: [
        { id: "button", label: "Button" },
        { id: "switch", label: "Switch" },
        { id: "checkbox", label: "Checkbox" }
      ] }
    ]}
  />
</Container>
```

### Floating

```tsx
<Sidebar
  floating
  defaultActive="Components"
  sections={[
    { title: "Library", items: [
      { label: "Overview", icon: "layoutDashboard" },
      { label: "Components", icon: "layers", badge: "107" },
      { label: "Tokens", icon: "palette" }
    ] }
  ]}
/>
```

## Do & Don't

### Sidebar

**Do** — Exactly one item carries the accent background; clicking moves it so the active page is always unambiguous.

```tsx
<Sidebar bordered defaultActive="Dashboard" sections={[
    { title: "Main", items: [
      { label: "Dashboard", icon: "layoutGrid" },
      { label: "Users", icon: "users", badge: "12" },
      { label: "Settings", icon: "settings" }
    ] }
  ]} />
```

**Don't** — Click an item: two rows wearing the active background means the nav can't tell you which page you're on.

```tsx
<View style={{ width: 240, overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.background }}>
  <View style={{ height: 56, flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: tokens.border, paddingHorizontal: 16 }}>
    <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground }}>Acme</Text>
  </View>
  <View style={{ gap: 4, padding: 8 }}>
    <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 6, backgroundColor: tokens.accent, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Dashboard</Text>
    </Pressable>
    <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 6, backgroundColor: tokens.accent, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Users</Text>
    </Pressable>
    <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Settings</Text>
    </Pressable>
  </View>
</View>
```

## Supported props

### SidebarProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| sections | SidebarSection[] \| undefined | no |  | Titled sections of nav rows. Use this or the flat `items` array. |
| items | SidebarItem[] \| undefined | no |  | Flat list of nav rows, wrapped into a single untitled section. |
| active | string \| number \| undefined | no |  | The active row (CONTROLLED), by id, by label, or by flat index across all rows. Omit for uncontrolled use. |
| defaultActive | string \| number \| undefined | no |  | Initial active row for uncontrolled use (a bare sidebar moves the highlight on press). |
| onSelect | ((item: SidebarItem, index: number, event: GestureResponderEvent) => void) \| undefined | no |  | Fired with the selected row and its flat index across all sections. |
| compact | boolean \| undefined | no | false | Density (pick one; default is the comfortable row). |
| bordered | boolean \| undefined | no | false | A rounded card inside the field hairline. |
| floating | boolean \| undefined | no | false | A rounded card lifted on the medium shadow (the bordered card natively). |
| embedded | boolean \| undefined | no | false | Navigation groups embedded in an app-owned rail: no frame, fill or width of its own and no scroll body (the host rail scrolls); the `header` and `footer` slots stack above and below the groups as plain blocks. |
| markers | boolean \| undefined | no | false | Trailing marker dots: the accent on the active row, the field hairline on a row of the current place (an item's `marked`, or every row of a `current` section). |
| collapsed | boolean \| undefined | no | false | Collapsed to the mini icon-rail (CONTROLLED). Omit for uncontrolled use. |
| defaultCollapsed | boolean \| undefined | no | false | Initial collapsed state for uncontrolled use (default expanded). |
| collapsible | boolean \| undefined | no | false | Show the collapse/expand toggle in the header slot. |
| onToggleCollapse | (() => void) \| undefined | no |  | Fired when the user taps the collapse/expand toggle. |
| openSections | string \| string[] \| undefined | no |  | Open collapsible sections (CONTROLLED), by section id/title. A single key by default, an array when `independentSections`. Pair with `onOpenSectionsChange`. |
| defaultOpenSections | string \| string[] \| undefined | no |  | Initial open sections for uncontrolled use. |
| onOpenSectionsChange | ((value: string \| string[]) => void) \| undefined | no |  | Fired with the next open sections whenever a section header toggles. |
| independentSections | boolean \| undefined | no | false | Allow more than one collapsible section open at once (default: one-open-at-a-time). |
| responsive | boolean \| undefined | no | false | Opt in to the responsive rail->drawer behavior. Off by default: a bare sidebar is the inline rail at every width, byte-identical to before. |
| drawer | boolean \| undefined | no | false | Always the drill-down drawer, at every width, never the inline rail: for an app shell whose only entry to the site tree is its own hamburger (a top app bar). Takes the same `open` / `onOpenChange` wiring as `responsive`, and wins over it. |
| open | boolean \| undefined | no | false | The narrow drawer's open state (CONTROLLED). The consumer wires its hamburger to this. |
| defaultOpen | boolean \| undefined | no | false | Initial open state for the uncontrolled narrow drawer (default closed). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the narrow drawer opens or closes (scrim tap, back, or a leaf selection). |
| drawerBreakpoint | BreakpointKey \| undefined | no |  | The width at and below which `responsive` switches to the drawer (default `lg` = 1024). |
| drawerWidth | number \| undefined | no |  | The narrow drawer panel width in px (default 288). |
| drawerContentInsetBottom | number \| undefined | no |  | Extra bottom padding for the drawer's scrolling content, so its last rows clear persistent chrome painting over the drawer (e.g. a native bottom tab bar on Android). |
| drawerRight | boolean \| undefined | no | false | Slide the drawer in from the end (right) edge instead of the start (left). |
| drawerTop | boolean \| undefined | no | false | Drop the drawer down from the top edge (a top sheet). |
| drawerBottom | boolean \| undefined | no | false | Raise the drawer up from the bottom edge (a bottom sheet). |
| header | ReactNode \| ((collapsed: boolean) => ReactNode) | no |  | Optional top slot (a brand lockup / logo). A render function receives the collapsed state so it can show a compact mark in the rail. When `header` or `footer` is set, the panel becomes a pinned header + scrolling body (+ footer). |
| footer | ReactNode \| ((collapsed: boolean) => ReactNode) | no |  | Optional bottom slot (pinned below the scrolling sections). A render function receives the collapsed state so it can show a compact (icon-only) footer in the rail. |
| account | SidebarAccount \| undefined | no |  | The signed-in account, drawn as a filled card pinned to the foot of the column: a small avatar beside the name and a detail line in the third ink. The collapsed rail keeps the avatar alone. It sits under the groups (above a `footer` slot), and in the drawer under the drill-down. |
| accessibilityLabel | string \| undefined | no |  | The name of the sidebar's navigation landmark, a short statement of what it navigates ("Workspace", "Controls components"). A sidebar is a navigation landmark on every platform, and a page holding two navigation landmarks needs a distinct name on each, so a landmark list can tell them apart. In the narrow `responsive` drawer it names the drawer. Omit it and the landmark stays unnamed, as before. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.3.0/installation.md) for required peers and feature fallbacks.
