# Tabs

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: d27c9b7debc9f8fea1016a51d1f700b1572754ac7d4f68c83b30055d3798cc5a

Source: `src/organisms/tabs/tabs.md`
Human reference: https://canvas.nannier.com/components/tabs

## Public imports

```tsx
import { Tabs } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Underline, pill, vertical, with badges.

On the web the underline look marks the active tab with a glowing accent bar on
the row's hairline, pills sit on a rounded track with a raised thumb, and the
vertical rail washes its active row in the accent.
iOS draws its segmented
control (UISegmentedControl): underline and pills are a capsule track with a
raised thumb, and vertical is a grouped rail. Android draws Material 3's tabs.
In glass mode a filled selection is a
control-layer pane behind the selected label, in the platform skin's selected
tint with readable foreground ink. Solid mode keeps the complete platform
treatment.

## Usage

```tsx
<Tabs tabs={["General", "Security", "Notifications"]} />
```

## Variants

### Pill

```tsx
<Tabs pills tabs={["All", "Active", "Archived"]} />
```

### Vertical

```tsx
<Tabs vertical tabs={["General", "Security", "Notifications"]} />
```

### Responsive vertical

`responsive` renders a vertical rail as the horizontal underline look when the
component's own container is at or below `sm` (640): container-measured, so a
settings rail inside a narrow column flattens to a top tab bar instead of
starving the panel beside it.

```tsx
<Tabs vertical responsive tabs={["General", "Security", "Notifications"]} />
```

### Badge counts

On the web a count's numerals take their tab's own ink.

```tsx
<Tabs tabs={[{ label: "All", badge: "142" }, { label: "Active", badge: "89" }, { label: "Archived", badge: "53" }]} />
```

### Disabled tab

```tsx
<Tabs tabs={["Overview", { label: "Billing", disabled: true }, "Settings"]} />
```

### Leading glyphs

A tab item takes an `icon`, a kit glyph before its label in the label's ink (15 px on
the web), as a settings rail names its sections.

```tsx
<Tabs vertical tabs={[{ label: "General", icon: "settings2" }, { label: "Members", icon: "users" }, { label: "Security", icon: "shieldCheck" }]} />
```

### Block

On the web a `block` underline row is equal columns with no gap between them, each
label centred in its own column under its share of the rule.

```tsx
<Tabs block tabs={["Overview", "Activity", "Settings"]} />
```

### Scrollable overflow

A row longer than its container pans horizontally instead of clipping, at any
container width and with no prop: the scroller is inert while the row
fits,
and on Android it then takes no sideways drag either, so a tap that drifts
sideways still selects its tab and a swipe that starts across the row scrolls
the page (while TalkBack explores by touch the scroller stays enabled, so the
exploring finger reaches every tab).
Selecting a tab (press or arrow key)
scrolls it fully into view with a sliver of its neighbor left showing. `block` shares the row equally and never
overflows; a vertical rail stacks instead.

```tsx
<Tabs tabs={["General", "Security", "Notifications", "Billing", "Integrations", "Advanced"]} />
```

### Wrapped overflow

`wrap` lays a row longer than its container out on further lines inside one
track instead of panning it, so every tab is on screen at once: the track fills
its container and grows taller, its corners staying concentric with the pills.
Reach for it where the strip is a page's own navigation on a phone (the docs
example rail); keep the scroller where the strip sits in a toolbar that must stay
one line tall. `block` never overflows and wins over `wrap`; a `responsive`
vertical rail honors `wrap` once it flattens.

```tsx
<Tabs wrap tabs={["General", "Security", "Notifications", "Billing", "Integrations", "Advanced", "Members", "Audit log"]} />
```

## Do & Don't

### Underline

**Do** — Underline and foreground-color only the active tab; leave the rest muted with no rule.

```tsx
<Tabs tabs={["Overview", "Activity", "Settings"]} defaultActive={0} />
```

**Don't** — Underlining every tab erases the active indicator: there is no way to tell which view is current.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: tokens.border, alignSelf: "flex-start" }}>
  <Pressable style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Overview</Text>
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: 9999, backgroundColor: tokens.primary }} />
  </Pressable>
  <Pressable style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Activity</Text>
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: 9999, backgroundColor: tokens.primary }} />
  </Pressable>
  <Pressable style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Settings</Text>
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: 9999, backgroundColor: tokens.primary }} />
  </Pressable>
</View>
```

### Pill

**Do** — Exactly one pill gets the elevated background; the rest sit flat on the muted track.

```tsx
<Tabs tabs={["All", "Active", "Archived"]} defaultActive={0} pills />
```

**Don't** — Giving every pill the raised background makes the group read as three buttons, not one selection.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", gap: 4, alignSelf: "flex-start", borderRadius: 8, backgroundColor: tokens.muted, padding: 4 }}>
  <Pressable style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.background, boxShadow: "0px 16px 32px -22px rgba(121, 100, 214, 0.22)", paddingHorizontal: 12, paddingVertical: 6 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>All</Text>
  </Pressable>
  <Pressable style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.background, boxShadow: "0px 16px 32px -22px rgba(121, 100, 214, 0.22)", paddingHorizontal: 12, paddingVertical: 6 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Active</Text>
  </Pressable>
  <Pressable style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", justifyContent: "center", borderRadius: 6, backgroundColor: tokens.background, boxShadow: "0px 16px 32px -22px rgba(121, 100, 214, 0.22)", paddingHorizontal: 12, paddingVertical: 6 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Archived</Text>
  </Pressable>
</View>
```

### Vertical

**Do** — Wash the active rail item in the accent so the selected pane is unmistakable.

```tsx
<Tabs tabs={["General", "Security", "Notifications"]} defaultActive={0} vertical />
```

**Don't** — With no filled active item the rail collapses into a plain link list and loses its current selection.

```tsx
<View style={{ flexDirection: "column", alignItems: "stretch", gap: 4, width: 180 }}>
  <Pressable style={({ pressed }) => [{ width: "100%", flexDirection: "row", alignItems: "center", borderRadius: 6, backgroundColor: "transparent", paddingHorizontal: 12, paddingVertical: 8 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["muted-foreground"] }}>General</Text>
  </Pressable>
  <Pressable style={({ pressed }) => [{ width: "100%", flexDirection: "row", alignItems: "center", borderRadius: 6, backgroundColor: "transparent", paddingHorizontal: 12, paddingVertical: 8 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["muted-foreground"] }}>Security</Text>
  </Pressable>
  <Pressable style={({ pressed }) => [{ width: "100%", flexDirection: "row", alignItems: "center", borderRadius: 6, backgroundColor: "transparent", paddingHorizontal: 12, paddingVertical: 8 }, pressed ? { opacity: 0.9 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["muted-foreground"] }}>Notifications</Text>
  </Pressable>
</View>
```

## Supported props

### TabsProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| tabs | TabItem[] \| undefined | no |  | Triggers, left to right. Strings, or `{ label, badge }` for a count. |
| active | number \| undefined | no |  | Index of the active trigger; omit for uncontrolled use. |
| defaultActive | number \| undefined | no |  | Initial active index for uncontrolled use (a bare <Tabs /> switches out of the box). |
| onSelect | ((index: number) => void) \| undefined | no |  | Called with the pressed trigger's index (both modes). Matches TabBar and ButtonGroup, which also fire `onSelect` for the active-index change. |
| testID | string \| undefined | no |  | E2E hook forwarded to the tablist row. |
| pills | boolean \| undefined | no | false | Look (pick one; default is the underline look). Precedence when more than one is passed: pills, then vertical, then underline. |
| vertical | boolean \| undefined | no | false | Look (pick one; default is the underline look). Precedence when more than one is passed: pills, then vertical, then underline. |
| underline | boolean \| undefined | no | false | Look (pick one; default is the underline look). Precedence when more than one is passed: pills, then vertical, then underline. |
| block | boolean \| undefined | no | false | Layout: equal full-width triggers vs. leading-aligned hugging triggers. |
| wrap | boolean \| undefined | no | false | Layout (the underline and pills rows): a row longer than its container wraps onto further lines inside one track instead of panning in the overflow scroller, so every tab stays on screen at once. The track fills its container and grows taller, its corners concentric with the pills. `block` never overflows and wins; a `responsive` vertical rail honors it once it flattens. |
| responsive | boolean \| undefined | no | false | Responsive (vertical look only): render the EXISTING horizontal underline look when the component's own CONTAINER is at or below `sm` (640), where a side rail would starve the panel beside it. Container-measured with a viewport seed. `pills` and `underline` are unaffected. |
| disabled | boolean \| undefined | no | false |  |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
