# Navigation

Sidebar + Topbar + breadcrumbs + page header. The sidebar you see on the left of this very page is the production sidebar: same component, same width, same drawer behavior.

## Usage

```tsx
<Sidebar
  active="Dashboard"
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
<View className="w-[240px] overflow-hidden rounded-lg border border-border bg-background">
  <View className="h-14 flex-row items-center border-b border-border px-4">
    <Text className="text-base font-semibold text-foreground">Acme</Text>
  </View>
  <View className="gap-1 p-2">
    <Pressable className="flex-row items-center gap-3 rounded-md bg-accent px-3 py-2">
      <Text className="flex-1 text-sm font-medium text-foreground">Dashboard</Text>
    </Pressable>
    <Pressable className="flex-row items-center gap-3 rounded-md bg-accent px-3 py-2">
      <Text className="flex-1 text-sm font-medium text-foreground">Users</Text>
    </Pressable>
    <Pressable className="flex-row items-center gap-3 rounded-md px-3 py-2">
      <Text className="flex-1 text-sm text-muted-foreground">Settings</Text>
    </Pressable>
  </View>
</View>
```

### Topbar

**Do** — Push utilities to the right, keep one primary button, and demote the rest to ghost so the New action leads.

```tsx
<View className="h-14 w-[420px] max-w-full flex-row items-center rounded-lg border border-border bg-card px-4">
  <Text className="text-base font-semibold text-foreground">Dashboard</Text>
  <View className="ml-auto flex-row gap-2">
    <Button ghost small>Search</Button>
    <Button primary small>New</Button>
  </View>
</View>
```

**Don't** — Four solid primary buttons crammed left-to-right give the topbar no focal action and no breathing room.

```tsx
<View className="h-14 w-[420px] max-w-full flex-row items-center gap-2 rounded-lg border border-border bg-card px-4">
  <Text className="text-base font-semibold text-foreground">Dashboard</Text>
  <Button primary small>Search</Button>
  <Button primary small>Filter</Button>
  <Button primary small>Export</Button>
  <Button primary small>New</Button>
</View>
```

### Page header

**Do** — Page-header titles are 20-22px semibold: clearly the page label, never larger than the topbar brand.

```tsx
<View className="w-[420px] max-w-full">
  <Typography h4>Users</Typography>
  <Typography muted className="mt-1">Manage your team members.</Typography>
</View>
```

**Don't** — A 36px display heading on the page body competes with the topbar and screams louder than the content beneath it.

```tsx
<View className="w-[420px] max-w-full">
  <Typography h1>Users</Typography>
  <Typography muted className="mt-1">Manage your team members.</Typography>
</View>
```

### Breadcrumbs

**Do** — The final crumb is plain current-page text, not a link: it marks where you are, not where you can go.

```tsx
<Breadcrumb slash items={["Home", "Team", "Rachel Chen"]} />
```

**Don't** — Making the last crumb a link implies the current page is somewhere else to navigate to.

```tsx
<View className="flex-row flex-wrap items-center gap-1.5">
  <Pressable className="active:opacity-70">
    <Text className="text-sm text-muted-foreground">Home</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">/</Text>
  <Pressable className="active:opacity-70">
    <Text className="text-sm text-muted-foreground">Team</Text>
  </Pressable>
  <Text className="text-sm text-muted-foreground/60">/</Text>
  <Pressable className="active:opacity-70">
    <Text className="text-sm text-muted-foreground">Rachel Chen</Text>
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
<View className="w-[420px] max-w-full flex-row items-center border-b border-border">
  <Pressable className="flex-row items-center justify-center px-4 py-2.5">
    <Text className="text-sm font-medium text-foreground">Overview</Text>
    <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
  </Pressable>
  <Pressable className="flex-row items-center justify-center px-4 py-2.5">
    <Text className="text-sm font-medium text-foreground">Sessions</Text>
    <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
  </Pressable>
  <Pressable className="flex-row items-center justify-center px-4 py-2.5">
    <Text className="text-sm font-medium text-muted-foreground">Audit log</Text>
    <View className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-transparent" />
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
<View className="w-[420px] max-w-[480px] overflow-hidden rounded-lg border border-border bg-popover shadow-xl">
  <View className="flex-row items-center gap-2 border-b border-border px-3 py-3">
    <Text className="text-sm text-muted-foreground">Type a command or search...</Text>
  </View>
  <View className="p-1.5">
    <Pressable className="flex-row items-center gap-3 rounded-md bg-accent px-3 py-2">
      <Text className="flex-1 text-sm text-foreground">Create identity</Text>
    </Pressable>
    <Pressable className="flex-row items-center gap-3 rounded-md bg-accent px-3 py-2">
      <Text className="flex-1 text-sm text-foreground">Invite teammate</Text>
    </Pressable>
  </View>
</View>
```
