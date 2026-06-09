# Dropdowns

Floating menus triggered by a button: actions, options, navigation.

## Usage

```tsx
<Dropdown
  trigger="Actions"
  items={[
    { label: "Edit profile", icon: "✎" },
    { label: "Duplicate", icon: "⧉" },
    { label: "Settings", icon: "⚙" }
  ]}
/>
```

## Do & Don't

### Trigger

**Do** — Click Actions to open; click outside to dismiss.

```tsx
<Dropdown trigger="Actions" items={[
    { label: "Edit profile" },
    { label: "Duplicate" },
    { label: "Settings" }
  ]} />
```

**Don't** — Always open: it clutters the page and there's no way to dismiss it.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit profile" },
    { label: "Duplicate" },
    { label: "Settings" }
  ]} />
```

### Sectioning

**Do** — Click an item: group related actions under labels with a separator.

```tsx
<Dropdown trigger="Actions" open label="Create" items={[
    { label: "New file" },
    { label: "New folder" },
    { label: "Upload" },
    { label: "Rename", separatorBefore: true },
    { label: "Move to…" },
    { label: "Download" }
  ]} />
```

**Don't** — Click an item: a long, flat menu of eight actions is hard to scan.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "New file" },
    { label: "New folder" },
    { label: "Upload" },
    { label: "Rename" },
    { label: "Duplicate" },
    { label: "Move to…" },
    { label: "Download" },
    { label: "Delete" }
  ]} />
```

### Leading icons

**Do** — Click an item: give every row a leading icon so labels share one start column.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit", icon: "✎" },
    { label: "Duplicate", icon: "⧉" },
    { label: "Settings", icon: "⚙" }
  ]} />
```

**Don't** — Click an item: icons on some rows but not others leave labels misaligned and the column ragged.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit", icon: "✎" },
    { label: "Duplicate" },
    { label: "Settings", icon: "⚙" }
  ]} />
```

### Keyboard shortcuts

**Do** — Click an item: push shortcuts to a muted, right-aligned column so the eye can scan them.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit profile", shortcut: "⌘E" },
    { label: "Duplicate", shortcut: "⌘D" },
    { label: "Settings", shortcut: "⌘," }
  ]} />
```

**Don't** — Click an item: hints inline after the label crowd the text and never line up into a readable column.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit profile ⌘E" },
    { label: "Duplicate ⌘D" },
    { label: "Settings ⌘," }
  ]} />
```

### Disabled item

**Do** — Click Archive: nothing happens; a real disabled item doesn't respond.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit" },
    { label: "Archive", disabled: true },
    { label: "Duplicate" }
  ]} />
```

**Don't** — Click Archive: it looks disabled but still fires, a greyed item that works is a trap.

```tsx
<View className="self-start rounded-md border border-border bg-popover p-1 shadow-lg" style={{ minWidth: 200 }}>
  <Pressable className="flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent">
    <Text className="text-sm text-popover-foreground">Edit</Text>
  </Pressable>
  <Pressable className="flex-row items-center gap-2 rounded-sm px-2 py-1.5 opacity-50 active:bg-accent">
    <Text className="text-sm text-popover-foreground">Archive</Text>
  </Pressable>
  <Pressable className="flex-row items-center gap-2 rounded-sm px-2 py-1.5 active:bg-accent">
    <Text className="text-sm text-popover-foreground">Duplicate</Text>
  </Pressable>
</View>
```

### Destructive item

**Do** — Click an item: separate destructive actions with a divider, color them, and place them last.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit" },
    { label: "Duplicate" },
    { label: "Delete", destructive: true, separatorBefore: true }
  ]} />
```

**Don't** — Click an item: a destructive action wedged between routine ones invites a costly misclick.

```tsx
<Dropdown trigger="Actions" open items={[
    { label: "Edit" },
    { label: "Delete" },
    { label: "Duplicate" }
  ]} />
```
