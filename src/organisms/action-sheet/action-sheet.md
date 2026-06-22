# Action Sheet

The iOS modal action menu: a bottom sheet of choices summoned in response to a user action. It poses an optional title and message, lists a set of actions (any of which can be destructive), and offers a Cancel. Selecting an action runs it and closes the sheet; tapping the scrim or Cancel closes it without acting. For a small contextual menu anchored to a control, reach for Dropdown or RowMenu instead.

## Usage

```tsx
<ActionSheet
  open
  title="Photo"
  message="Choose how to add a photo."
  actions={[
    { label: "Take Photo", onPress: () => {} },
    { label: "Choose from Library", onPress: () => {} },
    { label: "Remove Photo", destructive: true, onPress: () => {} },
  ]}
/>
```

## Variants

### With a title and message

```tsx
<ActionSheet
  open
  title="Discard draft?"
  message="Your unsaved changes will be lost."
  actions={[
    { label: "Discard Changes", destructive: true, onPress: () => {} },
    { label: "Keep Editing", onPress: () => {} },
  ]}
/>
```

### Actions only

```tsx
<ActionSheet
  open
  actions={[
    { label: "Share", onPress: () => {} },
    { label: "Duplicate", onPress: () => {} },
    { label: "Move", onPress: () => {} },
  ]}
/>
```

### Destructive action

```tsx
<ActionSheet
  open
  title="Delete this file?"
  message="This permanently removes the file. This action cannot be undone."
  actions={[{ label: "Delete File", destructive: true, onPress: () => {} }]}
/>
```

### Disabled action

```tsx
<ActionSheet
  open
  actions={[
    { label: "Save", onPress: () => {} },
    { label: "Save As…", disabled: true, onPress: () => {} },
    { label: "Export", onPress: () => {} },
  ]}
/>
```

## Do & Don't

### Right tool for the job

**Do** — Use an Action Sheet for a short list of choices triggered by a user action, with the dangerous option marked destructive.

```tsx
<ActionSheet
  open
  title="Photo"
  actions={[
    { label: "Take Photo", onPress: () => {} },
    { label: "Choose from Library", onPress: () => {} },
    { label: "Remove Photo", destructive: true, onPress: () => {} },
  ]}
/>
```

**Don't** — Use an Action Sheet for a single yes/no confirmation; an Alert Dialog is the focused tool for that.

```tsx
<ActionSheet
  open
  title="Are you sure?"
  actions={[{ label: "OK", onPress: () => {} }]}
/>
```

### Name the action, not a generic verb

**Do** — Label each row with the action it performs (Take Photo, Delete File, Move).

```tsx
<ActionSheet
  open
  actions={[
    { label: "Delete File", destructive: true, onPress: () => {} },
    { label: "Move to Folder", onPress: () => {} },
  ]}
/>
```

**Don't** — Generic labels force the user to re-read the title to know what each row does.

```tsx
<ActionSheet
  open
  title="Delete file?"
  actions={[
    { label: "Yes", destructive: true, onPress: () => {} },
    { label: "No", onPress: () => {} },
  ]}
/>
```
