# StackedList

Vertical lists with avatar, two-line items, and trailing metadata. Used for contacts, activity feeds, and data previews.

## Usage

```tsx
<StackedList
  items={[
    { name: "Rachel Chen", detail: "rachel.chen@example.com", meta: "admin" },
    { name: "Ada Lovelace", detail: "ada@example.com", meta: "editor" },
    { name: "Kevin Turner", detail: "kevin@example.com", meta: "viewer" }
  ]}
/>
```

## Variants

### Clickable

```tsx
<StackedList
  items={[
    { name: "Rachel Chen", detail: "rachel.chen@example.com", meta: "2h ago" },
    { name: "Ada Lovelace", detail: "ada@example.com", meta: "5h ago" },
    { name: "Kevin Turner", detail: "kevin@example.com", meta: "1d ago" }
  ]}
  clickable
/>
```

### Card

```tsx
<StackedList
  items={[
    { name: "Rachel Chen", detail: "Engineering Lead" },
    { name: "Ada Lovelace", detail: "Staff Engineer" }
  ]}
  card
  title="Team members"
  addAction="Add"
  rowMenu
/>
```

## Do & Don't

### Two-line with avatar

**Do** — Primary line bold; secondary line smaller and muted, truncated so long values never wrap.

```tsx
<StackedList items={[
    { name: "Rachel Chen", detail: "rachel.chen@example.com", initials: "RC" }
  ]} />
```

**Don't** — Equal weight on both lines flattens the hierarchy; the email competes with the name.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, overflow: "hidden", ...shadow("sm"), width: "100%", maxWidth: 560 }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 12 }}>
    <Avatar name="Rachel Chen">RC</Avatar>
    <View style={{ minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
      <Text style={{ fontSize: 13.5, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
      <Text style={{ fontSize: 13.5, fontWeight: "600", color: tokens.foreground }}>rachel.chen@example.com</Text>
    </View>
  </View>
</View>
```

### Clickable

**Do** — Wrap the row in a link with a hover background and a trailing chevron to signal drilldown.

```tsx
<StackedList clickable items={[
    { name: "Ada Lovelace", detail: "ada@example.com", meta: "5h ago", initials: "AL" }
  ]} />
```

**Don't** — A drilldown row with no hover state and no chevron gives no hint it is interactive.

```tsx
<StackedList items={[
    { name: "Ada Lovelace", detail: "ada@example.com", meta: "5h ago", initials: "AL" }
  ]} />
```

### Card surface group

**Do** — Separate the titled header with a rule and give each row a trailing action menu.

```tsx
<StackedList card title="Team members" addAction="Add" rowMenu items={[
    { name: "Rachel Chen", detail: "Engineering Lead", initials: "RC" }
  ]} />
```

**Don't** — A header with no rule blends into the rows, and dropping the per-row action removes the affordance.

```tsx
<View style={{ borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, overflow: "hidden", ...shadow("sm"), width: "100%", maxWidth: 560 }}>
  <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 12 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Team members</Text>
  </View>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 20, paddingVertical: 12 }}>
    <Avatar name="Rachel Chen">RC</Avatar>
    <View style={{ minWidth: 0, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
      <Text style={{ fontSize: 13.5, fontWeight: "600", color: tokens.foreground }}>Rachel Chen</Text>
      <Text style={{ fontSize: 12, lineHeight: 16, color: tokens["muted-foreground"] }}>Engineering Lead</Text>
    </View>
  </View>
</View>
```
