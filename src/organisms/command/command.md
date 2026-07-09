# Command Palette

Cmd+K search: navigation, actions, recent items.

## Usage

```tsx
<Command
  defaultActive={0}
  placeholder="Type a command..."
  trigger
  groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
      { label: "Open File", icon: "📂", shortcut: "Ctrl+O" },
      { label: "Save", icon: "💾", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "▸" },
      { label: "Go to Settings", icon: "▸" }
    ] }
  ]}
/>
```

## Variants

### Mode - inline

```tsx
<Command
  defaultActive={0}
  placeholder="Type a command..."
  groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
      { label: "Open File", icon: "📂", shortcut: "Ctrl+O" },
      { label: "Save", icon: "💾", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "▸" },
      { label: "Go to Settings", icon: "▸" }
    ] }
  ]}
/>
```

### Footer with key hints

```tsx
<Command
  defaultActive={0}
  placeholder="Type a command..."
  trigger
  footer
  groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
      { label: "Open File", icon: "📂", shortcut: "Ctrl+O" },
      { label: "Save", icon: "💾", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "▸" },
      { label: "Go to Settings", icon: "▸" }
    ] }
  ]}
/>
```

## Do & Don't

### Trigger

**Do** — Surface the shortcut in a trailing kbd so the trigger advertises the faster keyboard path.

```tsx
<Command trigger />
```

**Don't** — A bare search button hides the keyboard shortcut, so power users never learn the &#8984;K entry point.

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: "transparent", paddingHorizontal: 12, paddingVertical: 6 }}>
  <Icon search muted size={14} />
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Search...</Text>
</Pressable>
```

### Inline

**Do** — Group commands under labels with separators and highlight the first match so results stay scannable.

```tsx
<Command open placeholder="Type a command..." defaultActive={0} groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
      { label: "Save", icon: "💾", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "▸" },
      { label: "Go to Settings", icon: "▸" }
    ] }
  ]} />
```

**Don't** — Dumping every command into one flat list with no labels makes the palette hard to scan.

```tsx
<Command open placeholder="Type a command..." defaultActive={-1} groups={[
    { items: [
      { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
      { label: "Save", icon: "💾", shortcut: "Ctrl+S" },
      { label: "Go to Dashboard", icon: "▸" },
      { label: "Go to Settings", icon: "▸" }
    ] }
  ]} />
```
