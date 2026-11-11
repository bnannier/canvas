# RowMenu

Package: @nannier/canvas
Version: 4.3.1
Status: source-snapshot (not proof of an npm release)
Source SHA-256: 7e6c5223234f7d08b8647454c5cf0c8ef1d2da6425c2d4d231d846016c668d78

Source: `src/organisms/row-menu/row-menu.md`
Human reference: https://canvas.nannier.com/components/row-menu

## Public imports

```tsx
import { RowMenu } from "@nannier/canvas";
```

The following examples are source excerpts. Supply application data and handlers; snippets using `tokens` read `const { tokens } = useTheme()` inside a component. Import React hooks from React. Intentional “Don't” examples illustrate unsupported patterns.

Vertical action menu items and navigation links.

On the web the ··· trigger is a 32px square on the field hairline, washed while its
menu is open or under the pointer, and it opens a card menu 220 wide: rows 34 tall
with a muted leading glyph beside the label, and a destructive row in red.
iOS and
Android keep their platform context menus in the theme's colours.

In glass mode the menu is a dense-layer glass card beside its glyph; a row's
callback fires the moment it is pressed. Solid mode paints the skin's own menu.
Board's card menus are RowMenus and behave the same.

## Usage

```tsx
<RowMenu
  items={[
    { label: "Edit" },
    { label: "Duplicate" },
    { label: "Delete", destructive: true, separatorBefore: true }
  ]}
/>
```

## Variants

### Links

```tsx
<RowMenu links items={[{ label: "Profile" }, { label: "Billing" }, { label: "Members" }]} />
```

### Section label

```tsx
<RowMenu sectionLabel="Actions" items={[{ label: "Edit" }, { label: "Duplicate" }, { label: "Rename" }]} />
```

### Leading icons

```tsx
<RowMenu
  items={[
    { label: "Edit", icon: "pencil" },
    { label: "Duplicate", icon: "copy" },
    { label: "Settings", icon: "settings" }
  ]}
/>
```

### Disabled item

Mark an item `disabled` when its action is unavailable in the current context; the row dims,
does not fire `onSelect`, keeps the menu open, and is announced as disabled.

```tsx
<RowMenu items={[{ label: "Edit" }, { label: "Duplicate" }, { label: "Clear column", disabled: true }]} />
```

### Trailing hints

A row can end in a keyboard `shortcut` (the mono face in the third ink; a destructive
row's in its own ink, dimmed), a `submenu` chevron, a soft accent `badge` or a quiet mono
`meta`.

```tsx
<RowMenu
  items={[
    { label: "Edit details", icon: "pencil", shortcut: "⌘E" },
    { label: "Move to…", icon: "folderOpen", submenu: true },
    { label: "Delete", icon: "trash2", destructive: true, separatorBefore: true, shortcut: "⌘⌫" }
  ]}
/>
```

### Inline

`inline` draws the menu in place, with no ··· trigger and no overlay: the rows sit in
the menu's own panel, filling the width the parent gives them. With `links` it is a
grouped link list instead (below).

```tsx
<RowMenu
  inline
  items={[
    { label: "Edit details", icon: "pencil", shortcut: "⌘E" },
    { label: "Duplicate", icon: "copy", shortcut: "⌘D" },
    { label: "Archive", icon: "archive", separatorBefore: true }
  ]}
/>
```

### Inline links

`inline links` is a grouped link list: rows split by hairlines, each ending in its
`badge` or `meta` and a chevron.

```tsx
<RowMenu
  inline
  links
  items={[
    { label: "Profile", icon: "userRound" },
    { label: "Notifications", icon: "bell", badge: "3 new" },
    { label: "Integrations", icon: "plug", meta: "3" }
  ]}
/>
```

## Do & Don't

### When to use

**Do** — Collapse per-row actions behind a ··· trigger; keep Delete separated and danger-colored.

```tsx
<RowMenu open sectionLabel="Actions" items={[
    { label: "Edit", icon: "pencil" },
    { label: "Duplicate", icon: "copy" },
    { label: "Delete", icon: "trash", destructive: true, separatorBefore: true }
  ]} />
```

**Don't** — Splaying every row action inline multiplies visual noise across every table row.

```tsx
<View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
  <Button ghost small>Edit</Button>
  <Button ghost small>Duplicate</Button>
  <Button destructive small>Delete</Button>
</View>
```

### Actions

**Do** — Click an item: place destructive actions last, color them, and split them off with a divider.

```tsx
<RowMenu open items={[
    { label: "Edit" },
    { label: "Duplicate" },
    { label: "Delete", destructive: true, separatorBefore: true }
  ]} />
```

**Don't** — Click an item: a destructive action sandwiched between routine ones invites a costly misclick.

```tsx
<RowMenu open items={[
    { label: "Edit" },
    { label: "Delete", destructive: true },
    { label: "Duplicate" }
  ]} />
```

### Links

**Do** — Pass `links` so rows render as real navigation links a browser can open in a new tab or bookmark.

```tsx
<RowMenu open links items={[
    { label: "Profile" },
    { label: "Billing" },
    { label: "Members" }
  ]} />
```

**Don't** — Buttons can't be opened in a new tab, bookmarked, or middle-clicked, navigation needs real links.

```tsx
<RowMenu open items={[
    { label: "Profile" },
    { label: "Billing" },
    { label: "Members" }
  ]} />
```

## Supported props

### RowMenuProps

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| items | RowMenuItem[] | yes |  | The menu rows, top to bottom. |
| open | boolean \| undefined | no | false | Controlled open state. Omit for uncontrolled (the trigger toggles it). |
| onOpenChange | ((open: boolean) => void) \| undefined | no |  | Fired when the open state changes. |
| links | boolean \| undefined | no | false | Render rows as navigation links rather than action buttons. |
| inline | boolean \| undefined | no | false | The menu drawn in place, with no ⋯ trigger and no overlay: the action rows in the menu's own panel, filling the width the parent gives it. With `links` it is a grouped link list instead: hairline-split rows, each ending in its `badge` or `meta` and a chevron. `open`, `onOpenChange` and `triggerLabel` do nothing here. |
| sectionLabel | string \| undefined | no |  | Show a muted section label heading the menu. |
| onSelect | ((item: RowMenuItem, index: number) => void) \| undefined | no |  | Fired with the selected item and its index when a row is pressed. |
| triggerLabel | string \| undefined | no | "More options" | Accessible name for the icon-only ⋯ trigger. Defaults to "More options". |
| testID | string \| undefined | no |  | E2E hook forwarded to the root element. |
| style | LayoutStyle | no |  | Composition within a parent only, never a restyle hook and never a width: the parent layout container provides the bounds. |

See [installation](https://canvas.nannier.com/ai/4.3.1/installation.md) for required peers and feature fallbacks.
