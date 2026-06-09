# Overlays

Floating surfaces: drawers, modals, popovers, toasts.

## Usage

```tsx
<Overlay
  trigger="Open panel"
  title="Edit Identity"
  description="Visible above the parent page so the user can compare."
  drawer
/>
```

## Variants

### Surface - modal

```tsx
<Overlay
  trigger="Open panel"
  title="Edit Identity"
  description="Visible above the parent page so the user can compare."
  modal
/>
```

### Surface - toast

```tsx
<Overlay
  trigger="Open panel"
  title="Edit Identity"
  description="Visible above the parent page so the user can compare."
  sheet
/>
```

## Do & Don't

### Drawer (SlideOver)

**Do** — Slide the form in from the edge so the parent page stays visible beneath it.

```tsx
<Overlay open drawer title="Edit Identity" description="Visible above the parent page so the user can compare." doneLabel="Save" />
```

**Don't** — A centered, page-blocking modal for a routine edit hides the very record the user wants to reference.

```tsx
<Dialog open destructive title="Delete identity?" description="This cannot be undone." confirmLabel="Delete" cancelLabel="Cancel" />
```

### Modal (Confirm)

**Do** — Name the verb (Delete) and flag destructive actions with the danger style.

```tsx
<Dialog open destructive title="Delete identity?" description="This cannot be undone." confirmLabel="Delete" cancelLabel="Cancel" />
```

**Don't** — Generic Yes/No on a default-styled button hides both the stakes and what is being confirmed.

```tsx
<Dialog open title="Delete identity?" confirmLabel="Yes" cancelLabel="No" />
```

### Toast

**Do** — Keep toasts to passive confirmation of something already done; offer Undo, not a blocking choice.

```tsx
<View className="flex-row items-start justify-between gap-3 rounded-lg border border-border bg-popover px-4 py-3 shadow-lg">
  <View>
    <Text className="text-sm font-medium text-popover-foreground">Identity deleted</Text>
    <Text className="text-xs text-muted-foreground">You can undo this for 10 seconds.</Text>
  </View>
  <Pressable className="active:opacity-70">
    <Text className="text-muted-foreground">×</Text>
  </Pressable>
</View>
```

**Don't** — A toast that demands a decision can be auto-dismissed before the user acts, and steals focus from a transient surface.

```tsx
<View className="flex-row items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-popover px-4 py-3 shadow-lg">
  <View>
    <Text className="text-sm font-medium text-popover-foreground">Delete this identity?</Text>
    <View className="mt-2 flex-row gap-2">
      <Button outline small>Cancel</Button>
      <Button destructive small>Delete</Button>
    </View>
  </View>
  <Pressable className="active:opacity-70">
    <Text className="text-muted-foreground">×</Text>
  </Pressable>
</View>
```

### Row menu

**Do** — Collapse per-row actions behind a ··· trigger; keep Delete separated and danger-colored.

```tsx
<RowMenu open sectionLabel="Actions" items={[
    { label: "Edit", icon: "✎" },
    { label: "Duplicate", icon: "⧉" },
    { label: "Delete", icon: "🗑", destructive: true, separatorBefore: true }
  ]} />
```

**Don't** — Splaying every row action inline multiplies visual noise across every table row.

```tsx
<View className="flex-row flex-wrap gap-2">
  <Button ghost small>Edit</Button>
  <Button ghost small>Duplicate</Button>
  <Button destructive small>Delete</Button>
</View>
```
