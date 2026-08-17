# Command

Cmd+K search: navigation, actions, recent items. The search row is a real
input: typing filters the grouped rows to the matching labels, and a query
that matches nothing shows a muted "No results" row.

## Usage

```tsx
<Command
  defaultActive={0}
  trigger
  groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "file", shortcut: "Ctrl+N" },
      { label: "Open File", icon: "folder", shortcut: "Ctrl+O" },
      { label: "Save", icon: "save", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "arrowRight" },
      { label: "Go to Settings", icon: "arrowRight" }
    ] }
  ]}
/>
```

## Variants

### Inline

```tsx
<Command
  defaultActive={0}
  groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "file", shortcut: "Ctrl+N" },
      { label: "Open File", icon: "folder", shortcut: "Ctrl+O" },
      { label: "Save", icon: "save", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "arrowRight" },
      { label: "Go to Settings", icon: "arrowRight" }
    ] }
  ]}
/>
```

### Footer with key hints

```tsx
<Command
  defaultActive={0}
  trigger
  footer
  groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "file", shortcut: "Ctrl+N" },
      { label: "Open File", icon: "folder", shortcut: "Ctrl+O" },
      { label: "Save", icon: "save", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "arrowRight" },
      { label: "Go to Settings", icon: "arrowRight" }
    ] }
  ]}
/>
```

### Filtering

Typing narrows the rows; `defaultQuery` seeds the filter (here only the file
actions match), and groups left with no match drop out.

```tsx
<Command
  defaultActive={0}
  defaultQuery="file"
  groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "file", shortcut: "Ctrl+N" },
      { label: "Open File", icon: "folder", shortcut: "Ctrl+O" },
      { label: "Save", icon: "save", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "arrowRight" },
      { label: "Go to Settings", icon: "arrowRight" }
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

**Don't** — A bare search button hides the keyboard shortcut, so power users never learn the ⌘K entry point.

```tsx
<Pressable style={{ flexDirection: "row", alignItems: "center", gap: 8, alignSelf: "flex-start", borderRadius: 6, borderWidth: 1, borderColor: tokens.input, backgroundColor: "transparent", paddingHorizontal: 12, paddingVertical: 6 }}>
  <Icon search muted size={14} />
  <Text style={{ fontSize: 14, lineHeight: 20, color: tokens.foreground }}>Search...</Text>
</Pressable>
```

### Inline

**Do** — Group commands under labels with separators and highlight the first match so results stay scannable.

```tsx
<Command open defaultActive={0} groups={[
    { heading: "Actions", items: [
      { label: "New File", icon: "file", shortcut: "Ctrl+N" },
      { label: "Save", icon: "save", shortcut: "Ctrl+S" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard", icon: "arrowRight" },
      { label: "Go to Settings", icon: "arrowRight" }
    ] }
  ]} />
```

**Don't** — Dumping every command into one flat list with no labels makes the palette hard to scan.

```tsx
<Command open defaultActive={-1} groups={[
    { items: [
      { label: "New File", icon: "file", shortcut: "Ctrl+N" },
      { label: "Save", icon: "save", shortcut: "Ctrl+S" },
      { label: "Go to Dashboard", icon: "arrowRight" },
      { label: "Go to Settings", icon: "arrowRight" }
    ] }
  ]} />
```
