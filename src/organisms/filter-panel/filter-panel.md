# FilterPanel

Sidebar filter rail with chip pills for active filters.

## Usage

```tsx
<FilterPanel
  bordered
  groups={[
    { title: "Status", options: [
      { label: "Active", checked: true, count: "128" },
      { label: "Pending", count: "12", checked: false },
      { label: "Archived", count: "2", checked: false }
    ] },
    { title: "Schema", options: [
      { label: "Default", checked: true, count: "96" },
      { label: "Custom", count: "46", checked: false }
    ] },
    { title: "MFA", options: [
      { label: "Enabled", count: "84", checked: false },
      { label: "Disabled", count: "58", checked: false }
    ] }
  ]}
/>
```

## Do & Don't

### Sidebar

**Do** — Give each chip a × so a single filter can be removed in place, and keep it in sync with the sidebar checkbox.

```tsx
<Row wrap snug>
  <Chip primary onRemove={() => {}}>Active</Chip>
  <Chip primary onRemove={() => {}}>Default</Chip>
</Row>
```

**Don't** — Active-filter chips with no remove affordance leave no way to clear one filter without hunting back through the sidebar.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
  <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 9999, backgroundColor: tokens.primary, paddingHorizontal: 10, paddingVertical: 4 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["primary-foreground"] }}>Active</Text>
  </View>
  <View style={{ flexDirection: "row", alignItems: "center", alignSelf: "flex-start", borderRadius: 9999, backgroundColor: tokens.primary, paddingHorizontal: 10, paddingVertical: 4 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens["primary-foreground"] }}>Default</Text>
  </View>
</View>
```

### Inline

**Do** — Surface two or three primary filters and tuck the rest behind "+ Add filter" so the bar stays one scannable row.

```tsx
<Row wrap alignCenter snug>
  <Button primary small iconRight={<Icon chevronDown primaryForeground size={12} />}>Status</Button>
  <Button outline small iconRight={<Icon chevronDown size={12} />}>Role</Button>
  <Button link small iconLeft={<Icon plus size={14} />}>Add filter</Button>
</Row>
```

**Don't** — Eight inline dropdowns wrap into a wall of buttons, which defeats the compact bar; that volume of filtering belongs in the sidebar rail.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Status</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Role</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Schema</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>MFA</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Region</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Created</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Last seen</Text>
    <Icon chevronDown size={12} />
  </Pressable>
  <Pressable style={{ height: 32, flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: tokens.background, paddingHorizontal: 12 }}>
    <Text style={{ fontSize: 12, lineHeight: 16, fontWeight: "500", color: tokens.foreground }}>Team</Text>
    <Icon chevronDown size={12} />
  </Pressable>
</View>
```
