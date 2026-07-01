# Navigation

Sidebar + Topbar + breadcrumbs + page header. The sidebar you see on the left of this very page is the production sidebar: same component, same width, same drawer behavior.

## Usage

```tsx
<Sidebar
  active="Dashboard"
  onSelect={() => {}}
  sections={[
    { title: "Main", items: [
      { label: "Dashboard", icon: "◉" },
      { label: "Users", icon: "○", badge: "12" },
      { label: "Settings", icon: "◇" }
    ] },
    { title: "Reports", items: [
      { label: "Analytics", icon: "△" }
    ] }
  ]}
/>
```

## Do & Don't

### Sidebar

**Do** — Exactly one item carries the accent background; clicking moves it so the active page is always unambiguous.

```tsx
<Sidebar bordered active="Dashboard" sections={[
    { title: "Main", items: [
      { label: "Dashboard", icon: "◉" },
      { label: "Users", icon: "○", badge: "12" },
      { label: "Settings", icon: "◇" }
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

### Topbar

**Do** — Push utilities to the right, keep one primary button, and demote the rest to ghost so the New action leads.

```tsx
<Card style={{ width: 420, maxWidth: "100%" }}>
  <Row between alignCenter pad style={{ height: 56 }}>
    <Typography lead semibold>Dashboard</Typography>
    <Row snug>
      <Button ghost small>Search</Button>
      <Button primary small>New</Button>
    </Row>
  </Row>
</Card>
```

**Don't** — Four solid primary buttons crammed left-to-right give the topbar no focal action and no breathing room.

```tsx
<View style={{ height: 56, width: 420, maxWidth: "100%", flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.card, paddingHorizontal: 16 }}>
  <Text style={{ fontSize: 16, lineHeight: 24, fontWeight: "600", color: tokens.foreground }}>Dashboard</Text>
  <Button primary small>Search</Button>
  <Button primary small>Filter</Button>
  <Button primary small>Export</Button>
  <Button primary small>New</Button>
</View>
```

### Page header

**Do** — Page-header titles are 20-22px semibold: clearly the page label, never larger than the topbar brand.

```tsx
<Column tight style={{ width: 420, maxWidth: "100%" }}>
  <Typography h4>Users</Typography>
  <Typography muted>Manage your team members.</Typography>
</Column>
```

**Don't** — A 36px display heading on the page body competes with the topbar and screams louder than the content beneath it.

```tsx
<View style={{ width: 420, maxWidth: "100%" }}>
  <Typography h1>Users</Typography>
  <Typography muted style={{ marginTop: 4 }}>Manage your team members.</Typography>
</View>
```

### Breadcrumbs

**Do** — The final crumb is plain current-page text, not a link: it marks where you are, not where you can go.

```tsx
<Breadcrumb slash items={["Home", "Team", "Rachel Chen"]} />
```

**Don't** — Making the last crumb a link implies the current page is somewhere else to navigate to.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 6 }}>
  <Pressable style={({ pressed }) => [pressed ? { opacity: 0.7 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Home</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>/</Text>
  <Pressable style={({ pressed }) => [pressed ? { opacity: 0.7 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Team</Text>
  </Pressable>
  <Text style={{ fontSize: 14, lineHeight: 20, color: alpha(tokens["muted-foreground"], 0.6) }}>/</Text>
  <Pressable style={({ pressed }) => [pressed ? { opacity: 0.7 } : null]}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Rachel Chen</Text>
  </Pressable>
</View>
```

### Tabs

**Do** — Click a tab: exactly one carries the primary underline so the active facet is always singular.

```tsx
<Tabs underline active={0} tabs={["Overview", "Sessions", "Audit log"]} />
```

**Don't** — Two underlined tabs at once breaks the one-active-facet contract and hides which view you're reading.

```tsx
<View style={{ width: 420, maxWidth: "100%", flexDirection: "row", alignItems: "center", borderBottomWidth: 1, borderColor: tokens.border }}>
  <Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Overview</Text>
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: 9999, backgroundColor: tokens.primary }} />
  </Pressable>
  <Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens.foreground }}>Sessions</Text>
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: 9999, backgroundColor: tokens.primary }} />
  </Pressable>
  <Pressable style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", paddingHorizontal: 16, paddingVertical: 10 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, fontWeight: "500", color: tokens["muted-foreground"] }}>Audit log</Text>
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 2, borderRadius: 9999, backgroundColor: "transparent" }} />
  </Pressable>
</View>
```

### Command palette

**Do** — A search icon and esc hint signal input, and a single highlighted row shows exactly what Enter will run.

```tsx
<Command open active={0} placeholder="Type a command or search..." groups={[
    { heading: "Actions", items: [
      { label: "Create identity", shortcut: "C" },
      { label: "Invite teammate" }
    ] }
  ]} />
```

**Don't** — No search affordance and two highlighted rows: nothing tells you to type or which result Enter will run.

```tsx
<View style={{ width: 420, maxWidth: 480, overflow: "hidden", borderRadius: 8, borderWidth: 1, borderColor: tokens.border, backgroundColor: tokens.popover, ...shadow("xl") }}>
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderBottomWidth: 1, borderColor: tokens.border, paddingHorizontal: 12, paddingVertical: 12 }}>
    <Text style={{ fontSize: 14, lineHeight: 20, color: tokens["muted-foreground"] }}>Type a command or search...</Text>
  </View>
  <View style={{ padding: 6 }}>
    <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 6, backgroundColor: tokens.accent, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Create identity</Text>
    </Pressable>
    <Pressable style={{ flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 6, backgroundColor: tokens.accent, paddingHorizontal: 12, paddingVertical: 8 }}>
      <Text style={{ flexGrow: 1, flexShrink: 1, flexBasis: "0%", fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Invite teammate</Text>
    </Pressable>
  </View>
</View>
```
