# Sidebar

App navigation rail with collapsible sections and active highlighting. The sidebar on the left of this page is a thin adapter over this very `Sidebar` component: it feeds the docs' nav tree in and gets the same collapse, accordion, and active-highlight behavior back.

In glass mode the active row paints a control-layer pane behind its icon, label
and badge; the drill-down drawer keeps its own row treatment. Solid mode keeps
the skin's own row fill.

On the web a hovered row's wash (the palette's translucent `hover`) fades in over
150 ms and back out when the pointer leaves, in the rail and the drill-down alike;
the pressed and active fills still switch at once, and Reduce Motion makes the wash
instant.

Add `responsive` to make it adapt across breakpoints: it stays the accordion rail on desktop, and at and below the `lg` breakpoint (1024px) it becomes a start-edge (left, RTL-aware) **navigation drawer** that drills through the same `sections` one level at a time (tap a group to slide in to its rows, back to return). Drive the drawer's open state with `open` / `onOpenChange` from your own hamburger button; the `header` and `footer` slots pin above and below the drill-down, just as in the rail. The drawer slides from the start (left) edge by default; `drawerRight`, `drawerTop`, and `drawerBottom` change which edge it slides in from. (This page's own left nav does exactly this: an accordion rail here, a drill-down drawer on a phone.)

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

## Usage

The one `Sidebar` below is the whole story: on desktop it is the collapsible accordion rail (tap the header chevron to shrink it to icons); narrow the window to a phone and the same component becomes a start-edge drill-down **Liquid Glass menu** opened by the top bar's hamburger, exactly like this page's own left nav. `AppShell` is the docs' live app frame (the top bar and placeholder page); the `Sidebar` wiring is the part you copy.

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
