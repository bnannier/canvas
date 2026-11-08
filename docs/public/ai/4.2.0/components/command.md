# Command

Package: @nannier/canvas
Version: 4.2.0
Status: source-snapshot (not proof of an npm release)
Source SHA-256: ffd42edcc8828d3edcdcfd4bb3a9835f8b54674438055997f10ebf5989e7e006

Source: `src/organisms/command/command.md`
Human reference: https://canvas.nannier.com/components/command

## Public imports

```tsx
import { Command } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Cmd+K search: navigation, actions, recent items.

The search row is a real input: typing filters the grouped rows to the matching
labels, and a query that matches nothing shows a muted "No results" row.

On every platform the palette is the v4 card: 520 wide at an 18-pixel corner, a 48-pixel
search row with an `esc` cap over a hairline,
mono eyebrows over 38-pixel rows (44 on
iOS, 48 on Android) with quiet icons
and mono shortcuts, the accent's soft wash under the
active row, and an optional footer of mono hints.
Neither iOS nor Android ships a
command palette, so both take this look in their own face.

In glass mode the triggered palette is a functional-layer glass card under the
search bar, with its own search field; the search editor keeps focus while typing
filters the rows. Solid mode paints the skin's own palette.

The search placeholder names the input and its result list. Supply `accessibilityLabel` when a more specific purpose is needed. `defaultActive={-1}` starts without a highlighted result: Enter selects nothing until navigation or hovering chooses a row. Either arrow key starts at the first result from this state. Controlled indices above the visible result count clamp to the last match; negative, fractional and non-finite indices leave no active result.

Use `filtered` when a search service or index supplies ranked groups; Command keeps
those rows and their order instead of filtering their labels again. An item's
`description` supplies its secondary text. `emptyMessage` provides both the initial
prompt and the no-match message.

Use `embedded` inside a `Dialog` or `Drawer` to inherit its surface and fill its
bounds. It has no effect when `trigger` is set. Long results scroll within the
palette. `autoFocus` focuses the inline field after the containing overlay captures
its opener, so closing restores the original control. `onKeyPress` runs before
built-in navigation; call `preventDefault()` to handle an application shortcut.

## Usage

```tsx
<Command
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
  groups={[
    { heading: "Actions", items: [
      { label: "New File" },
      { label: "Open File" },
      { label: "Save" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard" },
      { label: "Go to Settings" }
    ] }
  ]}
/>
```

### Footer with key hints

```tsx
<Command
  footer
  groups={[
    { heading: "Actions", items: [
      { label: "New File" },
      { label: "Open File" },
      { label: "Save" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard" },
      { label: "Go to Settings" }
    ] }
  ]}
/>
```

### Embedded search

```tsx
<Card flush>
  <Command embedded filtered defaultQuery="universal" groups={[
    { heading: "Guides", items: [
      { label: "Canvas", description: "A universal interface kit" }
    ] }
  ]} />
</Card>
```

### Filtering

Typing narrows the rows; `defaultQuery` seeds the filter (here only the file
actions match), and groups left with no match drop out.

```tsx
<Command
  defaultQuery="file"
  groups={[
    { heading: "Actions", items: [
      { label: "New File" },
      { label: "Open File" },
      { label: "Save" }
    ] },
    { heading: "Navigation", items: [
      { label: "Go to Dashboard" },
      { label: "Go to Settings" }
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

## Supported props

### CommandProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| placeholder | string \| undefined | no | "Search commands..." | Prompt shown in the empty search input. |
| accessibilityLabel | string \| undefined | no |  | Accessible purpose for the search input and result list. Defaults to the search placeholder. Supply this when the placeholder does not explain the task. |
| query | string \| undefined | no |  | The text typed into the search input (CONTROLLED). Filters the rows to the labels matching it (case-insensitive). Omit and use `defaultQuery` for uncontrolled use: a bare Command is searchable out of the box. |
| defaultQuery | string \| undefined | no |  | Initial query for uncontrolled use. |
| onQueryChange | ((query: string) => void) \| undefined | no |  | Fired with the new query on each keystroke (both modes). |
| groups | CommandGroup[] \| undefined | no |  | Grouped result rows. |
| filtered | boolean \| undefined | no | false | Groups are already filtered and ranked by the owner; preserve their order and contents. |
| embedded | boolean \| undefined | no | false | Fill the parent and inherit its surface, for composition inside a Dialog or Drawer. Ignored with trigger. |
| autoFocus | boolean \| undefined | no | false | Focus the inline search field after mounting, allowing the containing overlay to capture its opener first. |
| onKeyPress | ((e: TextInputKeyPressEvent) => void) \| undefined | no |  | Input keyboard handler, called before built-in navigation. preventDefault cancels built-in handling. |
| emptyMessage | string \| undefined | no |  | Content shown when there are no result rows, including an empty query. |
| active | number \| undefined | no |  | Flat index of the highlighted row (CONTROLLED), counted across the visible (query-matching) rows. Omit for uncontrolled use. |
| defaultActive | number \| undefined | no |  | Initial highlighted row for uncontrolled use (hovering a row moves it, typing resets it to the first match). |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (the search trigger toggles it). |
| defaultOpen | boolean \| undefined | no | false | Render the palette open initially for uncontrolled use (selecting a row closes it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes. |
| trigger | boolean \| undefined | no | false | Render a collapsed full-width search trigger above the palette (a search glyph + "Search..." + a trailing kbd cap). The palette card still renders inline below the trigger (gated by `open`), mirroring how Dropdown shows its trigger plus the open menu in the docs. |
| footer | boolean \| undefined | no | false | Append a footer hint bar below the list (↑ ↓ to navigate, ↵ to select, esc to close). |
| onSelect | ((item: CommandItem, index: number) => void) \| undefined | no |  | Called with the chosen item and its flat index (within the visible, query-matching rows) when a row is pressed. |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element; the scrolling results list gets `${testID}-results`. |
| style | StyleProp<ViewStyle> | no |  | Outer layout composition only (width/flex within a parent), never a restyle hook. |

See [installation](https://canvas.nannier.com/ai/4.2.0/installation.md) for required peers and feature fallbacks.
