# Navbars

Topbars with navigation links, search, and action buttons. Used as the primary app-level navigation.

## Usage

```tsx
<Navbar
  brand="Canvas"
  links={["Dashboard", "Users", "Settings"]}
  active={0}
  actionLabel="New"
  avatar="RC"
  bordered
/>
```

## Variants

### Layout - search

```tsx
<Navbar
  brand="Canvas"
  links={["Dashboard", "Users", "Settings"]}
  active={0}
  avatar="RC"
  bordered
/>
```

### Layout - mobile

```tsx
<Navbar
  brand="Canvas"
  links={["Dashboard", "Users", "Settings"]}
  active={0}
  actionLabel="New"
  avatar="RC"
/>
```

## Do & Don't

### Standard topbar

**Do** — Keep a few primary links inline and fold the rest behind a More menu.

```tsx
<Navbar bordered brand="Canvas" active={0} links={["Dashboard", "Users", "Settings"]} actionLabel="New" avatar="RC" />
```

**Don't** — Cramming every destination into the bar wraps the row and buries the primary links.

```tsx
<Navbar bordered brand="Canvas" active={0} links={[
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
<View style={{ width: "100%", overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", height: 56, alignItems: "center", gap: 8, backgroundColor: tokens.card, paddingHorizontal: 16 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "600", color: tokens.foreground }}>Canvas</Text>
    <View style={{ marginHorizontal: 16, maxWidth: 400, flexGrow: 1, flexShrink: 1, flexBasis: "0%" }}>
      <Pressable style={({ pressed }) => [{ flexDirection: "row", height: 34, width: "100%", alignItems: "center", gap: 8, borderRadius: 6, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, paddingHorizontal: 10 }, pressed ? { opacity: 0.9 } : null]}>
        <Icon search muted size={13} />
        <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", textAlign: "left", fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Search…</Text>
        <Kbd>⌘K</Kbd>
      </Pressable>
    </View>
  </View>
</View>
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
<View style={{ width: "100%", maxWidth: 360, overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border }}>
  <View style={{ flexDirection: "row", height: 56, alignItems: "center", gap: 8, backgroundColor: tokens.card, paddingHorizontal: 12 }}>
    <Pressable style={({ pressed }) => [{ height: 36, width: 36, alignItems: "center", justifyContent: "center", borderRadius: 6 }, pressed ? { backgroundColor: tokens.accent } : null]}>
      <View style={{ width: 18, gap: 4 }}>
        <View style={{ height: 2, width: "100%", borderRadius: 9999, backgroundColor: tokens["muted-foreground"] }} />
        <View style={{ height: 2, width: "100%", borderRadius: 9999, backgroundColor: tokens["muted-foreground"] }} />
        <View style={{ height: 2, width: "100%", borderRadius: 9999, backgroundColor: tokens["muted-foreground"] }} />
      </View>
    </Pressable>
    <Text style={{ fontSize: 13, fontWeight: "600", color: tokens.foreground }}>Canvas</Text>
    <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%" }} />
    <Avatar small src="/rachel-chen.jpg" name="RC" />
  </View>
</View>
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
