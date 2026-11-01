# TabBar

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 63292636c7ff2f224185aef7c96ac78124f9170a170b90ee11718addfa280643

Source: `src/organisms/tab-bar/tab-bar.md`
Human reference: https://canvas.nannier.com/components/tab-bar

## Public imports

```tsx
import { TabBar } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Bottom app navigation: a row of equal-width destinations, each an icon over a short label, with exactly one active.
The mobile idiom (the iOS 26 floating tab bar / Material 3 navigation bar), rendered through the glass functional layer.

iOS and web share the iOS 26 anatomy: a 62 px capsule that floats above the
content (which scrolls beneath it), inset from the sides, with the safe-area
inset kept under the capsule, and the selected destination washed in the accent
as a capsule covering its whole cell. Android docks the Material 3 bar
full-bleed, 80 tall under a hairline, with its 64 by 32 icon pill. In glass mode
the selection is a control-layer pane on the active destination: the cell
capsule on iOS and web, the icon pill on Android. Solid mode retains the
ordinary platform surface.

## Usage

```tsx
<TabBar
  items={[
    { key: "home", label: "Home", icon: (active) => <Icon home size={19} primary={active} muted={!active} /> },
    { key: "search", label: "Search", icon: (active) => <Icon search size={19} primary={active} muted={!active} /> },
    { key: "profile", label: "Profile", icon: (active) => <Icon user size={19} primary={active} muted={!active} /> }
  ]}
/>
```

## Variants

### Controlled

```tsx
<Stateful initial="home">
  {(active, setActive) => (
    <TabBar
      active={active}
      onSelect={setActive}
      items={[
        { key: "home", label: "Home", icon: (active) => <Icon home size={19} primary={active} muted={!active} /> },
        { key: "search", label: "Search", icon: (active) => <Icon search size={19} primary={active} muted={!active} /> },
        { key: "profile", label: "Profile", icon: (active) => <Icon user size={19} primary={active} muted={!active} /> }
      ]}
    />
  )}
</Stateful>
```

### Unread

An item with `unread` carries a small destructive dot over its glyph, and its accessible
name ends in ", unread". On the web the capsule floats 12 px off its container's sides
and bottom.

```tsx
<TabBar
  items={[
    { key: "home", label: "Home", icon: (active) => <Icon home size={19} primary={active} muted={!active} /> },
    { key: "inbox", label: "Inbox", unread: true, icon: (active) => <Icon inbox size={19} primary={active} muted={!active} /> },
    { key: "profile", label: "Profile", icon: (active) => <Icon user size={19} primary={active} muted={!active} /> }
  ]}
/>
```

## Do & Don't

### Tab Bar

**Do** — Exactly one destination carries the primary tint on both its icon and label,
over the raised cell capsule on iOS and web or Material 3's active-indicator pill on Android;
the rest stay muted, so the current tab is always singular and unmistakable. On web the capsule is what lets a bar and a `Sidebar` in the same app shell mark the current destination the same way across the breakpoint that swaps them.

```tsx
<TabBar
  active="home"
  onSelect={() => {}}
  items={[
    { key: "home", label: "Home", icon: (active) => <Icon home size={19} primary={active} muted={!active} /> },
    { key: "search", label: "Search", icon: (active) => <Icon search size={19} primary={active} muted={!active} /> },
    { key: "profile", label: "Profile", icon: (active) => <Icon user size={19} primary={active} muted={!active} /> }
  ]}
/>
```

**Don't** — Tinting every destination primary erases the active indicator: nothing tells you which tab is current.

```tsx
<View style={{ flexDirection: "row", alignItems: "center", borderTopWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, paddingTop: 6 }}>
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 }}>
    <Icon home size={19} primary />
    <Text style={{ fontSize: 11, lineHeight: 14, fontWeight: "600", color: tokens.primary }}>Home</Text>
  </View>
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 }}>
    <Icon search size={19} primary />
    <Text style={{ fontSize: 11, lineHeight: 14, fontWeight: "600", color: tokens.primary }}>Search</Text>
  </View>
  <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, paddingVertical: 4 }}>
    <Icon user size={19} primary />
    <Text style={{ fontSize: 11, lineHeight: 14, fontWeight: "600", color: tokens.primary }}>Profile</Text>
  </View>
</View>
```

## Supported props

### TabBarProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | TabBarItem[] | yes |  |  |
| active | string \| undefined | no |  | The active item's key; omit for uncontrolled use. |
| defaultActive | string \| undefined | no |  | Initial active key for uncontrolled use (defaults to the first item's key). |
| onSelect | ((key: string) => void) \| undefined | no |  | Called with the pressed destination's key (both modes). |
| testID | string \| undefined | no |  | E2E hook forwarded to the tablist row. |
| bottomInset | number \| undefined | no | 0 | Safe-area bottom inset, e.g. `insets.bottom`. It is added BELOW the bar's own symmetric vertical padding (not in place of it), so the bar clears the home indicator without making the bottom margin heavier than the top. Defaults to 0 (web desktop / no inset). |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only. Use bottomInset for the safe area. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
