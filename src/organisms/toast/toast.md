# Toast

A transient notification capsule. Render a `<Toast>` directly, or drive them imperatively: mount a `<ToastProvider>` near your app root and call `toast(...)` from the `useToast()` hook to enqueue auto-dismissing toasts that stack over the app.

## Usage

```tsx
<Toast message="Your changes were saved." action={{ label: "Undo", onPress: () => {} }} />
```

## Variants

### Success

```tsx
<Toast success message="Profile updated" description="Your changes are now live." action={{ label: "View", onPress: () => {} }} />
```

### Error

```tsx
<Toast error message="Upload failed" description="Check your connection and try again." action={{ label: "Retry", onPress: () => {} }} />
```

### Warning

```tsx
<Toast warning message="Storage almost full" description="Free up space to keep syncing." action={{ label: "Manage", onPress: () => {} }} />
```

### With an action

```tsx
<Toast message="Message archived" action={{ label: "Undo", onPress: () => {} }} />
```

### Dismissible, informational

```tsx
<Toast info message="A new version is available" onDismiss={() => {}} />
```

## Do & Don't

**Do** — Keep a toast to one short, plain message (with an optional one-line description), and pair an error or success intent with the matching message.

```tsx
<Toast success message="Copied to clipboard" />
```

**Don't** — Don't crowd a toast with long paragraphs or more than one action; a toast is a glance, not a dialog.

```tsx
<Toast
  message="We were unable to complete your request because the server returned an unexpected error and the operation was rolled back"
/>
```
