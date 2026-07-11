# Feed

Vertical activity streams with icons and timestamps. Used for audit logs, change history, and notification lists.

## Usage

```tsx
<Feed
  connector
  items={[
    { actor: "Rachel Chen", action: "approved the request", time: "2 hours ago" },
    { actor: "Ada Lovelace", action: "updated the description", time: "5 hours ago" },
    { actor: "System", action: "created the project", time: "3 days ago" }
  ]}
/>
```

## Variants

### Variant - avatar

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
        <Text style={{ fontWeight: "500" }}>Rachel Chen </Text>
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
        <Text style={{ fontWeight: "500" }}>System </Text>
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
