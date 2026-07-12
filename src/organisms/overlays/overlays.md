# Overlay

Floating surfaces: drawers, sheets, and modals.

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

### Surface - sheet

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
