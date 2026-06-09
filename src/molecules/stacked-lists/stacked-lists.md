# Stacked Lists

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

### Variant - clickable

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

### Variant - card

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
<View className="rounded-lg border border-border bg-card overflow-hidden shadow-sm w-full max-w-[560px]">
  <View className="flex-row items-center gap-3 px-5 py-3">
    <Avatar name="Rachel Chen">RC</Avatar>
    <View className="min-w-0 flex-1">
      <Text className="text-[13.5px] font-semibold text-foreground">Rachel Chen</Text>
      <Text className="text-[13.5px] font-semibold text-foreground">rachel.chen@example.com</Text>
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
<View className="rounded-lg border border-border bg-card overflow-hidden shadow-sm w-full max-w-[560px]">
  <View className="flex-row items-center justify-between px-5 py-3">
    <Text className="text-sm font-semibold text-foreground">Team members</Text>
  </View>
  <View className="flex-row items-center gap-3 px-5 py-3">
    <Avatar name="Rachel Chen">RC</Avatar>
    <View className="min-w-0 flex-1">
      <Text className="text-[13.5px] font-semibold text-foreground">Rachel Chen</Text>
      <Text className="text-xs text-muted-foreground">Engineering Lead</Text>
    </View>
  </View>
</View>
```
