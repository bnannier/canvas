# Command Palette

Cmd+K search: navigation, actions, recent items.

## Usage

```tsx
<Command
  active={0}
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

## Do & Don't

### Trigger

**Do** — Surface the shortcut in a trailing kbd so the trigger advertises the faster keyboard path.

```tsx
<Command trigger />
```

**Don't** — A bare search button hides the keyboard shortcut, so power users never learn the &#8984;K entry point.

```tsx
<Pressable className="flex-row items-center gap-2 self-start rounded-md border border-input bg-transparent px-3 py-1.5">
  <Icon search muted size={14} />
  <Text className="text-sm text-foreground">Search...</Text>
</Pressable>
```

### Inline

**Do** — Group commands under labels with separators and highlight the first match so results stay scannable.

```tsx
<Command open placeholder="Type a command..." active={0} groups={[
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
<Command open placeholder="Type a command..." active={-1} groups={[
    { items: [
      { label: "New File", icon: "📄", shortcut: "Ctrl+N" },
      { label: "Save", icon: "💾", shortcut: "Ctrl+S" },
      { label: "Go to Dashboard", icon: "▸" },
      { label: "Go to Settings", icon: "▸" }
    ] }
  ]} />
```
