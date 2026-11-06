# Feed

Package: @nannier/canvas
Version: 4.1.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 67dc17133b58d1a84056a7de4adc0eb91490ed8002a53a34897e3109a497dd42

Source: `src/molecules/feeds/feeds.md`
Human reference: https://canvas.nannier.com/components/feeds

## Public imports

```tsx
import { Feed } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Vertical activity streams with icons and timestamps. Used for audit logs, change history, and notification lists.

The events are a list, as in Tailwind UI, and each event is one of its items: a
screen reader announces the list with its number of events and moves through it
event by event. A pressable event is a button inside its item. The `label` prop
names the list (for example "Recent activity").

A `virtualized` feed with a bounded height scrolls its events in a list of its
own. On the web, while those events overflow, that list is a keyboard tab stop
(before the rows themselves when `onItemPress` makes them buttons), the
keyboard can scroll it, and while it has keyboard focus the feed's card draws
the theme's focus ring. Only the events near its viewport are mounted, and each
says where it sits in the whole feed, so a screen reader still counts every
event. Give a windowed feed a `label`: focused, a list with no name is named in
Chromium from the text of every event it has rendered, so the kit warns in
development when it has none.

`activity` provides the original Argus time gutter, sentence, and dividing rule.
`trace` provides a colored marker, optional halo, optional numeric time gutter,
and inline category label. These unframed rows inherit their owning panel. Pass
rich `content`, marker `color` and `halo`, and optional `kind` on each item.

## Usage

```tsx
<Feed
  items={[
    { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
    { actor: "Ada Lovelace", action: "merged", target: "release/4.2", time: "5 hours ago" },
    { actor: "System", action: "created the project", time: "3 days ago" }
  ]}
/>
```

## Variants

### Activity

```tsx
<Feed activity label="Recent activity" items={[{ time: "2m", action: "Scout completed discovery" }, { time: "18m", action: "Ranger restored the deployment" }]} />
```

### Trace

```tsx
<Feed trace label="Latest trace" items={[{ time: "00:00", kind: "Context", action: "Loaded the work item" }, { time: "01:05", kind: "Eval", action: "Checks passed" }]} />
```


### Icon lead

An item may name a kit glyph (`{ icon }`) for the connector node, which suits an
audit or automation stream where a glyph reads the kind of event faster than a
dot. Node content resolves in one order: the glyph on its disc, then a dot, the
first event's in the accent. The avatar lead ignores `icon` and keeps leading
with the person's 28px avatar on the same connector.

```tsx
<Feed
  items={[
    { icon: "shieldCheck", actor: "System", action: "rotated the signing key", time: "12 minutes ago" },
    { icon: "userPlus", actor: "Rachel Chen", action: "invited a teammate", time: "2 hours ago" },
    { icon: "gitMerge", actor: "Ada Lovelace", action: "merged a release", time: "1 day ago" }
  ]}
/>
```

### Avatar

```tsx
<Feed
  avatar
  items={[
    { actor: "Rachel Chen", action: "commented on the pull request", time: "2 hours ago" },
    { actor: "Ada Lovelace", action: "pushed 3 commits", time: "5 hours ago" },
    { actor: "Kevin Turner", action: "opened the pull request", time: "1 day ago" }
  ]}
/>
```

## Do & Don't

### Connector

**Do** — Drop the connector on the last item so the line terminates cleanly at the final event.

```tsx
<Feed connector items={[
    { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
    { actor: "System", action: "created the project", time: "3 days ago" }
  ]} />
```

**Don't** — Running the connector line past the final event leaves a dangling tail pointing at nothing.

```tsx
<View style={{ width: "100%", maxWidth: 420, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, overflow: "hidden", padding: 24 }}>
  <View style={{ position: "relative", flexDirection: "row", gap: 12, paddingBottom: 24 }}>
    <View style={{ position: "absolute", bottom: -24, left: 13, top: 28, width: 1, backgroundColor: tokens.border }} />
    <View style={{ height: 28, width: 28, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 9999, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card }}>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["muted-foreground"] }}>RC</Text>
    </View>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", paddingTop: 2 }}>
      <Text style={{ fontSize: 14, lineHeight: 20 }}>
        <Text style={{ fontWeight: "500", color: tokens.foreground }}>Rachel Chen </Text>
        <Text style={{ color: tokens["muted-foreground"] }}>approved the request</Text>
      </Text>
      <Text style={{ marginTop: 2, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>2 hours ago</Text>
    </View>
  </View>
  <View style={{ position: "relative", flexDirection: "row", gap: 12 }}>
    <View style={{ position: "absolute", bottom: -24, left: 13, top: 28, width: 1, backgroundColor: tokens.border }} />
    <View style={{ height: 28, width: 28, flexShrink: 0, alignItems: "center", justifyContent: "center", borderRadius: 9999, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card }}>
      <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["muted-foreground"] }}>SY</Text>
    </View>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", paddingTop: 2 }}>
      <Text style={{ fontSize: 14, lineHeight: 20 }}>
        <Text style={{ fontWeight: "500", color: tokens.foreground }}>System </Text>
        <Text style={{ color: tokens["muted-foreground"] }}>created the project</Text>
      </Text>
      <Text style={{ marginTop: 2, fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>3 days ago</Text>
    </View>
  </View>
</View>
```

### Avatar

**Do** — Lead with the person's avatar, bold the actor, and keep the action plus a relative timestamp muted.

```tsx
<Feed avatar items={[
    { actor: "Ada Lovelace", action: "pushed 3 commits", time: "5 hours ago", avatar: "/ada-lovelace.jpg" }
  ]} />
```

**Don't** — An anonymous avatar with no actor name and no timestamp strips the row of the who and the when.

```tsx
<View style={{ width: "100%", maxWidth: 420, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, overflow: "hidden" }}>
  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 12, paddingHorizontal: 20, paddingVertical: 16 }}>
    <View style={{ height: 40, width: 40, flexShrink: 0, alignItems: "center", justifyContent: "center", overflow: "hidden", borderRadius: 9999, backgroundColor: tokens.muted }}>
      <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "500", color: tokens["muted-foreground"] }}>?</Text>
    </View>
    <View style={{ minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
      <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Pushed 3 commits</Text>
    </View>
  </View>
</View>
```

## Supported props

### FeedProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | FeedItem[] \| undefined | no |  | Events to render, top to bottom. |
| activity | boolean \| undefined | no | false | Lead axis (pick one; default is the connector node + vertical line). |
| trace | boolean \| undefined | no | false | Lead axis (pick one; default is the connector node + vertical line). |
| connector | boolean \| undefined | no | false | Lead axis (pick one; default is the connector node + vertical line). |
| avatar | boolean \| undefined | no | false | Lead axis (pick one; default is the connector node + vertical line). |
| compact | boolean \| undefined | no | false | Density modifier: tightens the row padding and connector spacing. |
| onItemPress | ((index: number) => void) \| undefined | no |  | When set, each event row is pressable, reporting the row index. |
| label | string \| undefined | no |  | The feed's accessible name (e.g. "Recent activity"): a screen reader announces it with the list of events. A `virtualized` feed needs one: on the web its scroller is a keyboard stop while the events overflow, and Chromium names an unnamed stop from the text of every event it has rendered. |
| virtualized | boolean \| undefined | no | false | Render the rows through a windowed `FlatList` instead of mounting every row up front, for large lists. Give the list a bounded height (via `style`, e.g. `{ maxHeight: 400 }`) so it can scroll; without one it warns and renders eagerly anyway. Default (omitted) mounts all rows, unchanged. On the web, while the rows overflow, the windowed list is a keyboard tab stop the keyboard can scroll, and the feed's card draws the focus ring while it has keyboard focus. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.1.0/installation.md) for required peers and feature fallbacks.
