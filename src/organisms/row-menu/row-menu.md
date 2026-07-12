# RowMenu

Vertical action menu items and navigation links.

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

### Kind - links

```tsx
<RowMenu
  links
  items={[
    { label: "Profile" },
    { label: "Billing" },
    { label: "Members" },
    { label: "Settings" }
  ]}
/>
```

### Section label

```tsx
<RowMenu
  sectionLabel="Actions"
  items={[
    { label: "Edit" },
    { label: "Duplicate" },
    { label: "Delete", destructive: true, separatorBefore: true }
  ]}
/>
```

### Leading icons

```tsx
<RowMenu
  items={[
    { label: "Edit", icon: "pencil" },
    { label: "Duplicate", icon: "copy" },
    { label: "Delete", icon: "trash", destructive: true, separatorBefore: true }
  ]}
/>
```

## Do & Don't

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

**Do** — Pass `links` so rows render as real navigation links, and mark the current page with an active highlight.

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
