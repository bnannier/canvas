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
<View className="w-full overflow-hidden rounded-lg border border-border">
  <View className="flex-row h-14 items-center gap-2 bg-card px-4">
    <Text className="text-sm font-semibold text-foreground">Canvas</Text>
    <View className="mx-4 max-w-[400px] flex-1">
      <Pressable className="flex-row h-[34px] w-full items-center gap-2 rounded-md border border-border bg-card px-2.5 active:opacity-90">
        <Icon search muted size={13} />
        <Text className="flex-1 text-left text-sm text-muted-foreground">Search…</Text>
        <Kbd>⌘K</Kbd>
      </Pressable>
    </View>
  </View>
</View>
```

**Don't** — A live text field in the bar reads as a form input and offers no keyboard affordance.

```tsx
<View className="w-full overflow-hidden rounded-lg border border-border">
  <View className="flex-row h-14 items-center gap-2 bg-card px-4">
    <Text className="text-sm font-semibold text-foreground">Canvas</Text>
    <View className="mx-4 max-w-[400px] flex-1">
      <TextInput placeholder="Search…" className="h-9 w-full rounded-md border border-border bg-background px-3 py-1 text-sm text-foreground" />
    </View>
  </View>
</View>
```

### Mobile

**Do** — Collapse the links into a hamburger and keep only the logo and avatar in the bar.

```tsx
<View className="w-full max-w-[360px] overflow-hidden rounded-lg border border-border">
  <View className="flex-row h-14 items-center gap-2 bg-card px-3">
    <Pressable className="h-9 w-9 items-center justify-center rounded-md active:bg-accent">
      <View className="w-[18px] gap-[4px]">
        <View className="h-[2px] w-full rounded-full bg-muted-foreground" />
        <View className="h-[2px] w-full rounded-full bg-muted-foreground" />
        <View className="h-[2px] w-full rounded-full bg-muted-foreground" />
      </View>
    </Pressable>
    <Text className="text-[13px] font-semibold text-foreground">Canvas</Text>
    <View className="flex-1" />
    <Avatar small src="/rachel-chen.jpg" name="RC" />
  </View>
</View>
```

**Don't** — A full horizontal nav at phone width wraps onto a second row and crowds out the logo.

```tsx
<View className="w-full max-w-[360px] overflow-hidden rounded-lg border border-border">
  <View className="flex-row h-14 items-center gap-1 bg-card px-3">
    <Text className="text-[13px] font-semibold text-foreground">Canvas</Text>
    <View className="ml-2 flex-row flex-wrap gap-1">
      <Pressable className="rounded-md bg-accent px-3 py-1.5 active:opacity-90">
        <Text className="text-sm font-medium text-foreground">Dashboard</Text>
      </Pressable>
      <Pressable className="rounded-md px-3 py-1.5 active:opacity-90">
        <Text className="text-sm font-medium text-muted-foreground">Users</Text>
      </Pressable>
      <Pressable className="rounded-md px-3 py-1.5 active:opacity-90">
        <Text className="text-sm font-medium text-muted-foreground">Settings</Text>
      </Pressable>
      <Pressable className="rounded-md px-3 py-1.5 active:opacity-90">
        <Text className="text-sm font-medium text-muted-foreground">Billing</Text>
      </Pressable>
    </View>
  </View>
</View>
```
